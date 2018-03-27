from flask import current_app as app

from utils.string_processing import inflect_engine

offers_include = [
    {
        "key": "eventOccurence",
        "sub_joins": [
            {
                "key": "event"
            }
        ]
    },
    {
        "key": "thing",
        "sub_joins": [
            {
                "key": "venue"
            }
        ]
    }
]

locals = locals()

def get(collection_name, filter, resolve = lambda obj: obj):
    model_name = inflect_engine.singular_noun(collection_name, 1)
    model = app.model[model_name[0].upper() + model_name[1:]]
    query = model.query.filter() if filter is None else model.query.filter(filter)
    include = locals.get(collection_name + '_include')
    return [resolve(obj._asdict(include=include)) for obj in query]
