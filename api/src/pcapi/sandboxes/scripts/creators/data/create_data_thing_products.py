import logging
import random

from pcapi.core.categories import subcategories_v2 as subcategories
import pcapi.core.offers.factories as offers_factories
import pcapi.core.offers.models as offers_models
from pcapi.core.providers.titelive_gtl import GTLS
from pcapi.domain.music_types import music_types
from pcapi.repository import repository
from pcapi.sandboxes.scripts.mocks.thing_mocks import MOCK_AUTHOR_NAMES
from pcapi.sandboxes.scripts.mocks.thing_mocks import MOCK_DESCRIPTIONS
from pcapi.sandboxes.scripts.mocks.thing_mocks import MOCK_NAMES_DATA
from pcapi.sandboxes.scripts.mocks.user_mocks import MOCK_FIRST_NAMES
from pcapi.sandboxes.scripts.mocks.user_mocks import MOCK_LAST_NAMES


logger = logging.getLogger(__name__)


THINGS_PER_SUBCATEGORY = 2


def create_data_thing_products() -> dict[str, offers_models.Product]:
    logger.info("create_data_thing_products_data")

    thing_products_by_name = {}

    thing_subcategories = [s for s in subcategories.ALL_SUBCATEGORIES if not s.is_event]

    logger.info("create thing_subcategories data %d ...", len(thing_subcategories))
    id_at_providers = 5678

    for product_creation_counter in range(0, THINGS_PER_SUBCATEGORY):
        for thing_subcategories_list_index, thing_subcategory in enumerate(thing_subcategories):
            mock_index = (product_creation_counter + thing_subcategories_list_index) % len(MOCK_NAMES_DATA)

            name = "{} / {}".format(thing_subcategory.id, MOCK_NAMES_DATA[mock_index])
            is_online_only = thing_subcategory.is_online_only
            url = "https://ilestencoretemps.fr/" if is_online_only else None

            thing_product = offers_factories.ProductFactory(
                extraData={"author": MOCK_AUTHOR_NAMES[mock_index]},
                description=MOCK_DESCRIPTIONS[mock_index],
                idAtProviders=str(id_at_providers),
                isNational=is_online_only,
                name=MOCK_NAMES_DATA[mock_index],
                subcategoryId=thing_subcategory.id,
                url=url,
            )

            extraData = {}
            extra_data_index = 0
            for conditionalField in thing_product.subcategory.conditional_fields:
                conditional_index = product_creation_counter + thing_subcategories_list_index + extra_data_index
                if conditionalField in ["author", "performer", "speaker", "stageDirector"]:
                    mock_first_name_index = (
                        product_creation_counter + thing_subcategories_list_index + extra_data_index
                    ) % len(MOCK_FIRST_NAMES)
                    mock_first_name = MOCK_FIRST_NAMES[mock_first_name_index]
                    mock_last_name_index = (
                        product_creation_counter + thing_subcategories_list_index + extra_data_index
                    ) % len(MOCK_LAST_NAMES)
                    mock_last_name = MOCK_LAST_NAMES[mock_last_name_index]
                    mock_name = "{} {}".format(mock_first_name, mock_last_name)
                    extraData[conditionalField] = mock_name
                elif conditionalField == "musicType":
                    music_type_index: int = conditional_index % len(music_types)
                    music_type = music_types[music_type_index]
                    extraData[conditionalField] = str(music_type.code)
                    music_sub_type_index: int = conditional_index % len(music_type.children)
                    music_sub_type = music_type.children[music_sub_type_index]
                    extraData["musicSubType"] = str(music_sub_type.code)
                elif conditionalField == "ean":
                    extraData["ean"] = "".join(random.choices("123456789", k=13))
                elif conditionalField == "gtl_id":
                    extraData["gtl_id"] = random.choice(list(GTLS.keys()))
                extra_data_index += 1
            thing_product.extraData = extraData
            thing_products_by_name[name] = thing_product
            id_at_providers += 1

        product_creation_counter += len(thing_subcategories)

    repository.save(*thing_products_by_name.values())

    logger.info("created %d thing products", len(thing_products_by_name))

    return thing_products_by_name
