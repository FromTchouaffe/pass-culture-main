from pcapi.sandboxes.scripts.creators.industrial.create_industrial_activation_offers import (
    create_industrial_activation_offers,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_admin_users import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_app_users import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_bank_accounts import create_industrial_bank_accounts
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_bookings import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_criterion import (
    associate_criterion_to_one_offer_with_mediation,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_criterion import create_industrial_criteria
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_draft_offers import create_industrial_draft_offers
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_eac_data import create_eac_data
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_event_occurrences import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_event_offers import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_event_products import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_event_stocks import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_incidents import create_industrial_incidents
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_individual_offerers import (
    create_industrial_individual_offerers,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_invoices import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_iris import create_iris
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_mediations import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offer_validation_rules import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offerer_tags import create_industrial_offerer_tags
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offerer_with_custom_reimbursement_rule import (
    create_industrial_offerer_with_custom_reimbursement_rule,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offerers_stats import (
    create_industrial_offerers_stats,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offerers_with_pro_users import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_offers_with_activation_codes import (
    create_industrial_offers_with_activation_codes,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_pro_users import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_pro_users_api_keys import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_search_objects import (
    create_industrial_search_indexed_objects,
)
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_thing_offers import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_thing_products import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_thing_stocks import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_venues import *
from pcapi.sandboxes.scripts.creators.industrial.create_industrial_venues_with_timezone import (
    create_industrial_venues_with_timezone,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offer_with_thousand_stocks import (
    create_offer_with_thousand_stocks,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offerer_providers_for_apis import (
    create_offerer_providers_for_apis,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offerer_with_several_venues import (
    create_offerer_with_several_venues,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offerer_with_venue_provider_and_external_bookings import (
    create_industrial_provider_external_bookings,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offers_with_ean import create_offers_with_ean
from pcapi.sandboxes.scripts.creators.industrial.create_offers_with_price_categories import (
    create_offers_with_price_categories,
)
from pcapi.sandboxes.scripts.creators.industrial.create_offers_with_status import create_offers_with_status


def save_industrial_sandbox() -> None:
    create_iris()
    (offerers_by_name, pro_users_by_name) = create_industrial_offerers_with_pro_users()

    admin_users_by_name = create_industrial_admin_users()
    pro_users_by_name = create_industrial_pro_users(offerers_by_name)
    app_users_by_name = create_industrial_app_users()

    users_by_name = dict(dict(admin_users_by_name, **pro_users_by_name), **app_users_by_name)

    venues_by_name = create_industrial_venues(offerers_by_name)

    event_products_by_name = create_industrial_event_products()

    thing_products_by_name = create_industrial_thing_products()

    event_offers_by_name = create_industrial_event_offers(event_products_by_name, offerers_by_name)

    thing_offers_by_name = create_industrial_thing_offers(thing_products_by_name, offerers_by_name, venues_by_name)

    create_industrial_offerers_stats(offerers_by_name, event_offers_by_name)

    create_industrial_draft_offers(offerers_by_name)

    create_industrial_offers_with_activation_codes()

    offers_by_name = dict(event_offers_by_name, **thing_offers_by_name)

    event_occurrences_by_name = create_industrial_event_occurrences(event_offers_by_name)

    create_industrial_event_stocks(event_occurrences_by_name)

    create_industrial_thing_stocks(thing_offers_by_name)

    prepare_mediations_folders()
    create_industrial_mediations(offers_by_name)

    criteria_by_name = create_industrial_criteria()

    associate_criterion_to_one_offer_with_mediation(offers_by_name, criteria_by_name)

    create_industrial_bookings(offers_by_name, users_by_name)

    create_eac_data()

    # Now that they booked, we can expire these users' deposit.
    for name, user in users_by_name.items():
        if "has-booked-some-but-deposit-expired" in name:
            assert user.deposit  # helps mypy
            user.deposit.expirationDate = datetime.utcnow()
            repository.save(user.deposit)

    create_industrial_invoices()

    create_industrial_pro_users_api_keys(offerers_by_name)

    create_industrial_activation_offers()

    create_industrial_search_indexed_objects()

    create_industrial_provider_external_bookings()

    create_industrial_offerer_tags()

    create_offers_with_status()

    create_offer_with_thousand_stocks()

    create_offerer_with_several_venues()

    create_offers_with_price_categories()

    create_offerer_providers_for_apis()

    create_offers_with_ean()

    create_industrial_incidents()

    create_industrial_individual_offerers()

    create_industrial_bank_accounts()

    create_industrial_venues_with_timezone()
