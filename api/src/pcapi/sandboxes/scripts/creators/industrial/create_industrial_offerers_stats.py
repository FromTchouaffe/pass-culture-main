import datetime
import logging
import random

from pcapi.connectors.big_query.queries.offerer_stats import DAILY_CONSULT_PER_OFFERER_LAST_180_DAYS_TABLE
from pcapi.connectors.big_query.queries.offerer_stats import TOP_3_MOST_CONSULTED_OFFERS_LAST_30_DAYS_TABLE
import pcapi.core.offerers.factories as offerers_factories
import pcapi.core.offerers.models as offerers_models
import pcapi.core.offers.models as offers_models


logger = logging.getLogger(__name__)

randint_10_000 = random.randint(1, 10_000)

offer_count_cases = [
    [0, 0, 0, False],
    [0, 0, 0, True],
    [0, False],
    [0, True],
    [0, 0, True],
    [randint_10_000, 0, 0, True],
    [randint_10_000, randint_10_000, 0, True],
    [randint_10_000, randint_10_000, randint_10_000, True],
    [randint_10_000, True],
]


def create_top_30_days_offerers_stats(
    offerer: offerers_models.Offerer, offers: list[offers_models.Offer], count: list[int]
) -> None:
    top_3_offers_stats = []
    for el, numberOfViews in zip(offers, sorted(count, reverse=True)):
        top_3_offers_stats.append(offerers_models.TopOffersData(offerId=el.id, numberOfViews=numberOfViews))

    offerers_factories.OffererStatsFactory(
        offerer=offerer,
        table=TOP_3_MOST_CONSULTED_OFFERS_LAST_30_DAYS_TABLE,
        jsonData=offerers_models.OffererStatsData(top_offers=top_3_offers_stats),
    )


def create_180_days_view_stats(offerer: offerers_models.Offerer, has_view: int) -> None:
    daily_views_stats = []
    if has_view:
        views_count = random.randint(0, 1000)
        for i in range(180):
            views_count += random.randint(0, 1000) * random.randint(0, 10)
            daily_views_stats.append(
                offerers_models.OffererViewsModel(
                    eventDate=datetime.datetime.utcnow().date() - datetime.timedelta(days=180 - i),
                    numberOfViews=views_count,
                )
            )
    offerers_factories.OffererStatsFactory(
        offerer=offerer,
        table=DAILY_CONSULT_PER_OFFERER_LAST_180_DAYS_TABLE,
        jsonData=offerers_models.OffererStatsData(daily_views=daily_views_stats),
    )


def create_industrial_offerers_stats(
    offerers_by_name: dict[str, offerers_models.Offerer],
    event_offers_by_name: dict[str, offers_models.Offer],
) -> None:
    offerer_list = list(offerers_by_name.values())
    # Create different cases for the 9 first offerers
    # The 10th offerer whill have no data
    for index, case in enumerate(offer_count_cases):
        offerer = offerer_list[index]
        offers = list(el for el in event_offers_by_name.values() if el.venue.managingOffererId == offerer.id)
        create_top_30_days_offerers_stats(offerer, offers, case[:-1])
        create_180_days_view_stats(offerer, case[-1])
