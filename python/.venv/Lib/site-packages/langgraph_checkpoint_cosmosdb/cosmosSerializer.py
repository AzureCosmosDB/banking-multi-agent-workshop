import base64

class CosmosSerializer:
    def __init__(self, serde):
        self.serde = serde
    
    def dumps_typed(self, obj):
        type_, data = self.serde.dumps_typed(obj)
        data_base64 = base64.b64encode(data).decode('utf-8')
        return type_, data_base64

    def loads_typed(self, data):
        type_name, serialized_obj = data
        serialized_obj = base64.b64decode(serialized_obj.encode('utf-8'))
        return self.serde.loads_typed((type_name, serialized_obj))

    def dumps(self, obj):
        data = self.serde.dumps(obj)
        data_base64 = base64.b64encode(data).decode('utf-8')
        return data_base64

    def loads(self, serialized_obj):
        serialized_obj = base64.b64decode(serialized_obj.encode('utf-8'))
        return self.serde.loads(serialized_obj)