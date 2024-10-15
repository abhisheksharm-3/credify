import re
from typing import List, Dict, Any
import imagehash

def identify_hash_type(hash_value: str) -> str:
    # Image hashes are typically 64 characters long and contain only 0 and 1
    if len(hash_value) == 64 and set(hash_value).issubset({'0', '1'}):
        return 'image'
    # Video hashes are typically 16 characters long and contain hexadecimal values
    elif len(hash_value) == 16 and re.match(r'^[0-9a-fA-F]+$', hash_value):
        return 'video'
    else:
        return 'unknown'

def compare_hashes(hash1: str, hash2: str, hash_type: str) -> Dict[str, Any]:
    if hash_type == 'image':
        return compare_image_hashes(hash1, hash2)
    elif hash_type == 'video':
        return compare_video_hashes(hash1, hash2)
    else:
        return {"error": "Unknown hash type"}

def compare_image_hashes(hash1: str, hash2: str) -> Dict[str, Any]:
    h1 = imagehash.hex_to_hash(hash1)
    h2 = imagehash.hex_to_hash(hash2)
    distance = h1 - h2
    similarity = 1 - (distance / 64.0)
    return {
        "hash1": hash1,
        "hash2": hash2,
        "are_similar": similarity > 0.8,  # Using 0.8 as the threshold
        "similarity": similarity,
        "hamming_distance": distance
    }

def compare_video_hashes(hash1: str, hash2: str) -> Dict[str, Any]:
    h1 = int(hash1, 16)
    h2 = int(hash2, 16)
    distance = bin(h1 ^ h2).count('1')
    similarity = 1 - (distance / 64.0)
    return {
        "hash1": hash1,
        "hash2": hash2,
        "are_similar": similarity > 0.8,  # Using 0.8 as the threshold
        "similarity": similarity,
        "hamming_distance": distance
    }

def compare_hash_with_array(hash_to_compare: str, hash_array: List[str], file_type: str) -> Dict[str, Any]:
    results = []
    matching_hash = ""

    if not hash_array:
        return {
            "results": [],
            "matching_hash": "",
            "message": "The provided hash array is empty."
        }

    for hash_value in hash_array:
        hash_type = identify_hash_type(hash_value)
        if hash_type == file_type:
            comparison_result = compare_hashes(hash_to_compare, hash_value, file_type)
            results.append(comparison_result)
            
            if comparison_result['are_similar']:
                matching_hash = hash_value
                break  # Stop after finding the first similar hash

    if not results:
        return {
            "results": [],
            "matching_hash": "",
            "message": f"No hashes of type '{file_type}' found in the provided array."
        }

    if matching_hash:
        message = "Hash comparison completed successfully. A matching hash was found."
    else:
        message = "Hash comparison completed successfully. No sufficiently similar hash was found."

    return {
        "results": results,
        "matching_hash": matching_hash,
        "message": message
    }