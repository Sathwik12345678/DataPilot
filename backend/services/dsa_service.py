import heapq

def top_k_values(arr, k=3):

    if len(arr) == 0:
        return []

    return heapq.nlargest(k, arr)