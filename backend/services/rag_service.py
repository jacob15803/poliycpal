"""
RAG service for retrieving relevant chunks from ChromaDB.
"""
from typing import List, Dict
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')


class RAGService:
    """Retrieves relevant document chunks from ChromaDB based on queries."""
    
    def __init__(self):
        chroma_client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(anonymized_telemetry=False)
        )
        
        self.collections = {
            "IT": chroma_client.get_or_create_collection("it_policy"),
            "HR": chroma_client.get_or_create_collection("hr_policy"),
            "General": chroma_client.get_or_create_collection("general_policy"),
        }
    
    def retrieve_relevant_chunks(
        self,
        query: str,
        policy_area: str,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Retrieve top-k most relevant chunks for a query from a specific policy area.
        
        Args:
            query: User's question
            policy_area: "IT", "HR", or "General"
            top_k: Number of chunks to retrieve
        
        Returns:
            List of relevant chunks with metadata
        """
        collection = self.collections.get(policy_area)
        if not collection:
            return []
        
        # Embed query
        query_embedding = EMBEDDING_MODEL.encode(query).tolist()
        
        # Search
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        chunks = []
        if results.get("documents") and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                chunk = {
                    "text": doc,
                    "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
                    "distance": results["distances"][0][i] if results.get("distances") else None
                }
                chunks.append(chunk)
        
        return chunks
    
    def retrieve_from_all_areas(
        self,
        query: str,
        top_k_per_area: int = 5
    ) -> Dict[str, List[Dict]]:
        """
        Retrieve relevant chunks from all policy areas.
        
        Returns:
            Dict with keys "IT", "HR", "General" containing lists of chunks
        """
        results = {}
        for policy_area in ["IT", "HR", "General"]:
            results[policy_area] = self.retrieve_relevant_chunks(
                query, policy_area, top_k_per_area
            )
        return results

