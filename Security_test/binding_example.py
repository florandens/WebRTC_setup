
import socket
from stun_protocol.message import Message, MessageClass, MessageMethod
from stun_protocol.attribute import FingerprintAttribute
from stun_protocol.attribute import XorMappedAddressAttribute

# Create a STUN Binding Request message
message = Message(MessageClass.REQUEST, MessageMethod.BINDING)

# Pack the message into a buffer
buffer = message.pack()

# Send the message over a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
stun_server_address = ('stun.l.google.com', 19302) # Example STUN server
sock.sendto(buffer, stun_server_address)

# Receive the response from the STUN server
response, _ = sock.recvfrom(1024) # Buffer size of 1024 bytes

# Parse the received STUN message
received_message = Message.create(response)

# Print the details of the received message
print(f"Message Type: {received_message.message_class} {received_message.message_method}")
print(f"Transaction ID: {received_message.transaction_id.hex()}")

for attribute in received_message.attributes:
    if isinstance(attribute, XorMappedAddressAttribute):
        ip_address_bytes = attribute.address #xor IP address
        value = 0x2112A442                     #magic cookie
        bytes_value = value.to_bytes(4, byteorder='big')
        result = bytes(x ^ y for x, y in zip(ip_address_bytes, bytes_value))
        ip_address = socket.inet_ntoa(result)

        #port number
        port = attribute.port
        port_number = 0x2112 ^ port

        print(f"IP Address: {ip_address}")
        print(f"Port: {port_number}")

print(f"Attributes: {received_message.attributes}")