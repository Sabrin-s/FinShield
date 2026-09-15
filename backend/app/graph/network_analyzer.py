import networkx as nx
from typing import List, Dict, Any, Tuple

class AMLNetworkAnalyzer:
    """
    Graph analytics engine for detecting money laundering topologies (circular routing, mule rings, bridge nodes).
    """

    @staticmethod
    def build_transaction_graph(transactions: List[Dict[str, Any]]) -> nx.DiGraph:
        G = nx.DiGraph()
        for tx in transactions:
            src = str(tx.get("source_account"))
            dest = str(tx.get("destination_account"))
            amount = float(tx.get("amount", 0.0))
            tx_id = str(tx.get("transaction_id", ""))
            
            if not G.has_node(src):
                G.add_node(src, total_out=0.0, total_in=0.0)
            if not G.has_node(dest):
                G.add_node(dest, total_out=0.0, total_in=0.0)
                
            G.nodes[src]["total_out"] = G.nodes[src].get("total_out", 0.0) + amount
            G.nodes[dest]["total_in"] = G.nodes[dest].get("total_in", 0.0) + amount

            if G.has_edge(src, dest):
                G[src][dest]["weight"] += amount
                G[src][dest]["tx_count"] += 1
                G[src][dest]["tx_ids"].append(tx_id)
            else:
                G.add_edge(src, dest, weight=amount, tx_count=1, tx_ids=[tx_id])
        return G

    @staticmethod
    def find_circular_flows(G: nx.DiGraph, max_cycle_length: int = 5) -> List[List[str]]:
        """
        Detects closed directed loops (round-trip money laundering paths).
        """
        cycles = []
        try:
            simple_cycles = list(nx.simple_cycles(G))
            for cycle in simple_cycles:
                if 2 <= len(cycle) <= max_cycle_length:
                    # Append starting node to close visual loop
                    cycles.append(cycle + [cycle[0]])
        except Exception:
            pass
        return cycles

    @staticmethod
    def detect_mule_hubs(G: nx.DiGraph, fan_out_threshold: int = 3) -> List[Dict[str, Any]]:
        """
        Identifies funnel nodes (1 source sending to many mules) or consolidation nodes (many mules to 1 destination).
        """
        hubs = []
        for node in G.nodes():
            out_degree = G.out_degree(node)
            in_degree = G.in_degree(node)
            
            if out_degree >= fan_out_threshold:
                hubs.append({
                    "node": node,
                    "type": "FAN_OUT_DISPERSAL_HUB",
                    "degree": out_degree,
                    "total_amount": G.nodes[node].get("total_out", 0.0)
                })
            elif in_degree >= fan_out_threshold:
                hubs.append({
                    "node": node,
                    "type": "FAN_IN_COLLECTION_HUB",
                    "degree": in_degree,
                    "total_amount": G.nodes[node].get("total_in", 0.0)
                })
        return hubs

    def analyze(self, transactions: List[Dict[str, Any]], target_account: str = None) -> Dict[str, Any]:
        """
        Comprehensive graph analysis + UI format serialization.
        """
        G = self.build_transaction_graph(transactions)
        
        if len(G.nodes) == 0:
            return {
                "nodes": [],
                "edges": [],
                "metrics": {
                    "node_count": 0,
                    "edge_count": 0,
                    "has_circular_flow": False,
                    "is_mule_hub": False,
                    "max_hops": 0
                },
                "cycles": [],
                "mule_hubs": []
            }

        cycles = self.find_circular_flows(G)
        mule_hubs = self.detect_mule_hubs(G)
        
        # Centrality metrics
        try:
            degree_cent = nx.degree_centrality(G)
            pagerank = nx.pagerank(G, max_iter=100) if len(G.nodes) > 1 else {n: 1.0 for n in G.nodes}
        except Exception:
            degree_cent = {n: 1.0 for n in G.nodes}
            pagerank = {n: 1.0 for n in G.nodes}

        # Calculate max path length
        max_hops = 0
        try:
            if nx.is_directed_acyclic_graph(G):
                max_hops = nx.dag_longest_path_length(G)
            else:
                max_hops = len(G.nodes) - 1
        except Exception:
            max_hops = 1

        is_target_in_cycle = False
        if target_account:
            for c in cycles:
                if target_account in c:
                    is_target_in_cycle = True
                    break

        is_target_mule_hub = any(h["node"] == target_account for h in mule_hubs)

        # Build Cytoscape/D3 friendly nodes and edges
        nodes_data = []
        for node in G.nodes():
            is_target = (node == target_account)
            in_cycle = any(node in c for c in cycles)
            hub_info = next((h for h in mule_hubs if h["node"] == node), None)
            
            node_type = "ACCOUNT"
            if is_target:
                node_type = "SUBJECT_ACCOUNT"
            elif hub_info:
                node_type = hub_info["type"]
            elif in_cycle:
                node_type = "SHELL_INTERMEDIARY"

            nodes_data.append({
                "id": node,
                "label": node,
                "type": node_type,
                "in_degree": G.in_degree(node),
                "out_degree": G.out_degree(node),
                "total_in": round(G.nodes[node].get("total_in", 0.0), 2),
                "total_out": round(G.nodes[node].get("total_out", 0.0), 2),
                "centrality": round(degree_cent.get(node, 0.0), 3),
                "pagerank": round(pagerank.get(node, 0.0), 3),
                "in_cycle": in_cycle,
                "is_subject": is_target
            })

        edges_data = []
        for u, v, data in G.edges(data=True):
            # Check if this edge is part of a circular cycle
            is_cycle_edge = False
            for c in cycles:
                for i in range(len(c) - 1):
                    if c[i] == u and c[i+1] == v:
                        is_cycle_edge = True
                        break

            edges_data.append({
                "id": f"{u}->{v}",
                "source": u,
                "target": v,
                "amount": round(data["weight"], 2),
                "tx_count": data["tx_count"],
                "tx_ids": data["tx_ids"],
                "is_circular": is_cycle_edge
            })

        return {
            "nodes": nodes_data,
            "edges": edges_data,
            "metrics": {
                "node_count": len(G.nodes),
                "edge_count": len(G.edges),
                "has_circular_flow": len(cycles) > 0,
                "is_target_in_cycle": is_target_in_cycle,
                "is_mule_hub": is_target_mule_hub or len(mule_hubs) > 0,
                "max_hops": max_hops,
                "mule_hub_count": len(mule_hubs),
                "cycle_count": len(cycles)
            },
            "cycles": cycles,
            "mule_hubs": mule_hubs
        }

graph_analyzer = AMLNetworkAnalyzer()
