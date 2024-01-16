from jb_lang import *

equals = component({
    params: [
        {id: 'item1', dynamic: True },
        {id: 'item2', dynamic: True },
    ],
    impl: lambda ctx,item1,item2: item1(ctx) == item2(ctx)
})

gt = component({
    params: [
        {id: 'item1', dynamic: True },
        {id: 'item2', dynamic: True },
    ],
    impl: lambda ctx,item1,item2: item1(ctx) == item2(ctx)
})

__all__ = registerComps(globals())

