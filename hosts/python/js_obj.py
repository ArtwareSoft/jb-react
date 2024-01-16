class JSObj:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def __setattr__(self, name, value):
        self.__dict__[name] = value

    def __getattr__(self, name):
        if name in self.__dict__:
            return self.__dict__[name]
        
    def __getitem__(self, key):
        if key in self.__dict__:
            return self.__dict__[key]

    def __setitem__(self, key, value):
        self.__dict__[key] = value        

    def setdefault(self, key, default_value):
        if key not in self.__dict__:
            self.__dict__[key] = default_value
        return self.__dict__[key]
    
    def get(self, key, default_value=None):
        return self.__dict__.get(key, default_value)
    def keys(self):
        return self.__dict__.keys()
    def items(self):
        return self.__dict__.items()
    def update(self, other):
        if isinstance(other, JSObj):
            self.__dict__.update(other.__dict__)
        elif isinstance(other, dict):
            self.__dict__.update(other)
        elif other is None:
            return
        else:
            raise TypeError("Parameter must be a JSObj instance or a dictionary")
        
    def __str__(self):
        properties = ', '.join([f"{key}: {value}" for key, value in self.__dict__.items()])
        return f"JSObj({properties})"





