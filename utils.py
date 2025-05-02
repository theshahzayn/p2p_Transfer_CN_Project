import hashlib

def compute_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()
