from web3 import Web3

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
contract_address = "0xYourContractAddressHere"
abi = [...]  # Paste ABI from Remix here

contract = w3.eth.contract(address=contract_address, abi=abi)
account = w3.eth.accounts[0]

def store_file_hash(file_name, file_hash):
    tx = contract.functions.registerFile(file_name, file_hash).build_transaction({
        'from': account,
        'gas': 3000000,
        'nonce': w3.eth.get_transaction_count(account)
    })
    signed = w3.eth.account.sign_transaction(tx, private_key="YourPrivateKeyHere")
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)

def get_file_hash(file_name):
    return contract.functions.getFileHash(file_name).call()
