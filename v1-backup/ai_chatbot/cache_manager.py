#!/usr/bin/env python3
"""
Cache Manager for Faruk's AI Chatbot
Utility script to manage cached responses
"""

import json
import os
from typing import Dict, List

class CacheManager:
    def __init__(self, config_file="cache_config.json"):
        self.config_file = config_file
        self.config_path = os.path.join(os.path.dirname(__file__), config_file)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load configuration from JSON file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file {self.config_file} not found.")
            return {"cache_responses": {}, "settings": {}}
        except json.JSONDecodeError:
            print(f"Error parsing {self.config_file}.")
            return {"cache_responses": {}, "settings": {}}
    
    def _save_config(self):
        """Save configuration to JSON file"""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            print(f"✅ Configuration saved to {self.config_file}")
        except Exception as e:
            print(f"❌ Error saving configuration: {e}")
    
    def add_response(self, question: str, answer: str):
        """Add a new cached response"""
        if "cache_responses" not in self.config:
            self.config["cache_responses"] = {}
        
        key = question.lower().strip()
        self.config["cache_responses"][key] = answer.strip()
        self._save_config()
        print(f"✅ Added cached response for: '{question}'")
    
    def remove_response(self, question: str):
        """Remove a cached response"""
        key = question.lower().strip()
        if key in self.config.get("cache_responses", {}):
            del self.config["cache_responses"][key]
            self._save_config()
            print(f"✅ Removed cached response for: '{question}'")
        else:
            print(f"❌ No cached response found for: '{question}'")
    
    def list_responses(self):
        """List all cached responses"""
        cache = self.config.get("cache_responses", {})
        if not cache:
            print("📭 No cached responses found.")
            return
        
        print(f"📋 Found {len(cache)} cached responses:")
        print("-" * 50)
        for i, (question, answer) in enumerate(cache.items(), 1):
            print(f"{i}. Q: {question}")
            print(f"   A: {answer[:100]}{'...' if len(answer) > 100 else ''}")
            print()
    
    def search_responses(self, search_term: str):
        """Search cached responses"""
        cache = self.config.get("cache_responses", {})
        matches = []
        
        search_term = search_term.lower()
        for question, answer in cache.items():
            if search_term in question.lower() or search_term in answer.lower():
                matches.append((question, answer))
        
        if matches:
            print(f"🔍 Found {len(matches)} matches for '{search_term}':")
            print("-" * 50)
            for i, (question, answer) in enumerate(matches, 1):
                print(f"{i}. Q: {question}")
                print(f"   A: {answer[:100]}{'...' if len(answer) > 100 else ''}")
                print()
        else:
            print(f"❌ No matches found for '{search_term}'")
    
    def update_settings(self, similarity_threshold=None, cache_enabled=None):
        """Update cache settings"""
        if "settings" not in self.config:
            self.config["settings"] = {}
        
        if similarity_threshold is not None:
            self.config["settings"]["similarity_threshold"] = similarity_threshold
            print(f"✅ Updated similarity threshold to {similarity_threshold}")
        
        if cache_enabled is not None:
            self.config["settings"]["cache_enabled"] = cache_enabled
            print(f"✅ Cache {'enabled' if cache_enabled else 'disabled'}")
        
        self._save_config()
    
    def get_stats(self):
        """Get cache statistics"""
        cache = self.config.get("cache_responses", {})
        settings = self.config.get("settings", {})
        
        print("📊 Cache Statistics:")
        print(f"   Total responses: {len(cache)}")
        print(f"   Cache enabled: {settings.get('cache_enabled', True)}")
        print(f"   Similarity threshold: {settings.get('similarity_threshold', 0.6)}")
        print(f"   Cache indicator: {settings.get('cache_indicator', '⚡')}")


def main():
    """Interactive cache management"""
    manager = CacheManager()
    
    while True:
        print("\n" + "="*50)
        print("🤖 Faruk's Chatbot Cache Manager")
        print("="*50)
        print("1. List all cached responses")
        print("2. Add new cached response")
        print("3. Remove cached response")
        print("4. Search cached responses")
        print("5. Update settings")
        print("6. Show statistics")
        print("7. Exit")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            manager.list_responses()
        
        elif choice == "2":
            question = input("Enter the question/keyword: ").strip()
            answer = input("Enter the answer: ").strip()
            if question and answer:
                manager.add_response(question, answer)
            else:
                print("❌ Both question and answer are required.")
        
        elif choice == "3":
            question = input("Enter the question to remove: ").strip()
            if question:
                manager.remove_response(question)
            else:
                print("❌ Question is required.")
        
        elif choice == "4":
            search_term = input("Enter search term: ").strip()
            if search_term:
                manager.search_responses(search_term)
            else:
                print("❌ Search term is required.")
        
        elif choice == "5":
            print("Current settings:")
            manager.get_stats()
            threshold = input("Enter new similarity threshold (0.0-1.0, or press Enter to skip): ").strip()
            if threshold:
                try:
                    threshold = float(threshold)
                    if 0.0 <= threshold <= 1.0:
                        manager.update_settings(similarity_threshold=threshold)
                    else:
                        print("❌ Threshold must be between 0.0 and 1.0")
                except ValueError:
                    print("❌ Invalid threshold value")
        
        elif choice == "6":
            manager.get_stats()
        
        elif choice == "7":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
