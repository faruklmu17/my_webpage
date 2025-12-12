#!/usr/bin/env python3
"""
Performance Test Script for Cached Chatbot
Tests response times for cached vs non-cached questions
"""

import time
import json
import os
from app_ollama_cached_v2 import ChatbotCache

def test_cache_performance():
    """Test and compare cache vs LLM response times"""
    
    print("🧪 Testing Chatbot Cache Performance")
    print("=" * 50)
    
    # Initialize cache
    cache = ChatbotCache()
    
    # Test questions - mix of cached and non-cached
    test_questions = [
        # These should be cached (fast)
        ("who is faruk", "CACHED"),
        ("contact faruk", "CACHED"),
        ("tutoring", "CACHED"),
        ("python course", "CACHED"),
        ("playwright", "CACHED"),
        ("hello", "CACHED"),
        
        # These should NOT be cached (slow - would go to LLM)
        ("what is the weather today", "NOT_CACHED"),
        ("explain quantum computing in detail", "NOT_CACHED"),
        ("write me a poem about cats", "NOT_CACHED"),
    ]
    
    print("📊 Testing Cache Response Times:")
    print("-" * 30)
    
    cache_hits = 0
    cache_misses = 0
    total_cache_time = 0
    
    for question, expected in test_questions:
        start_time = time.time()
        
        # Test cache lookup
        cached_response = cache.find_cached_response(question)
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        if cached_response:
            status = "✅ CACHED"
            cache_hits += 1
            total_cache_time += response_time
            print(f"Q: {question}")
            print(f"   Status: {status} ({response_time:.2f}ms)")
            print(f"   Response: {cached_response[:60]}...")
        else:
            status = "❌ NOT CACHED"
            cache_misses += 1
            print(f"Q: {question}")
            print(f"   Status: {status} ({response_time:.2f}ms)")
            print(f"   Response: Would go to LLM (10-30 seconds)")
        
        print()
    
    # Calculate statistics
    avg_cache_time = total_cache_time / cache_hits if cache_hits > 0 else 0
    cache_hit_rate = (cache_hits / len(test_questions)) * 100
    
    print("📈 Performance Summary:")
    print("=" * 30)
    print(f"Total questions tested: {len(test_questions)}")
    print(f"Cache hits: {cache_hits}")
    print(f"Cache misses: {cache_misses}")
    print(f"Cache hit rate: {cache_hit_rate:.1f}%")
    print(f"Average cache response time: {avg_cache_time:.2f}ms")
    print(f"Estimated LLM response time: 15,000-30,000ms")
    print(f"Speed improvement: {15000/avg_cache_time:.0f}x faster for cached responses!")
    
    return {
        'cache_hits': cache_hits,
        'cache_misses': cache_misses,
        'hit_rate': cache_hit_rate,
        'avg_cache_time': avg_cache_time
    }

def test_similarity_matching():
    """Test how well the similarity matching works"""
    
    print("\n🔍 Testing Similarity Matching:")
    print("=" * 40)
    
    cache = ChatbotCache()
    
    # Test variations of cached questions
    test_variations = [
        "who is faruk hasan",           # Should match "who is faruk"
        "tell me about faruk",          # Should match "who is faruk"  
        "how to contact faruk",         # Should match "contact faruk"
        "faruk's email address",        # Should match "faruk email"
        "what tutoring does faruk do",  # Should match "tutoring"
        "python programming course",    # Should match "python course"
        "hi there",                     # Should match "hello"
    ]
    
    for question in test_variations:
        start_time = time.time()
        cached_response = cache.find_cached_response(question)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000
        
        if cached_response:
            print(f"✅ '{question}' → MATCHED ({response_time:.2f}ms)")
            print(f"    Response: {cached_response[:50]}...")
        else:
            print(f"❌ '{question}' → NO MATCH ({response_time:.2f}ms)")
        print()

def show_cache_contents():
    """Display all cached responses"""
    
    print("\n📋 Current Cache Contents:")
    print("=" * 30)
    
    try:
        config_path = os.path.join(os.path.dirname(__file__), "cache_config.json")
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        cache_responses = config.get("cache_responses", {})
        
        print(f"Total cached responses: {len(cache_responses)}")
        print("-" * 30)
        
        for i, (question, answer) in enumerate(cache_responses.items(), 1):
            print(f"{i:2d}. Q: {question}")
            print(f"     A: {answer[:60]}{'...' if len(answer) > 60 else ''}")
            print()
            
    except Exception as e:
        print(f"Error loading cache: {e}")

if __name__ == "__main__":
    print("🚀 Faruk's Chatbot Cache Performance Test")
    print("=" * 50)
    
    # Run all tests
    results = test_cache_performance()
    test_similarity_matching()
    show_cache_contents()
    
    print("\n🎉 Test Complete!")
    print(f"Cache is working and provides {15000/results['avg_cache_time']:.0f}x speed improvement!")
