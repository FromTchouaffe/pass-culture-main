from datetime import datetime, timedelta

import pytest

from models import ApiErrors, Venue
from models.pc_object import serialize
from tests.test_utils import create_offer_with_thing_product, create_offer_with_event_product
from utils.human_ids import humanize
from validation.stocks import check_dates_are_allowed_on_new_stock, check_dates_are_allowed_on_existing_stock


@pytest.mark.standalone
class CheckDatesAreAllowedOnNewStockTest:
    class OfferIsOnThingTest:
        def test_raises_error_with_beginning_and_end_datetimes(self):
            # Given
            offer = create_offer_with_thing_product(Venue())
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'beginningDatetime': serialize(beginningDatetime),
                'endDatetime': serialize(beginningDatetime + timedelta(days=1))
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['global'] == [
                'Impossible de mettre des dates de début et fin si l\'offre ne porte pas sur un évenement'
            ]

        def test_raises_error_with_beginning_datetime_only(self):
            # Given
            offer = create_offer_with_thing_product(Venue())
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'beginningDatetime': serialize(beginningDatetime)
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['global'] == [
                'Impossible de mettre des dates de début et fin si l\'offre ne porte pas sur un évenement'
            ]

        def test_raises_error_with_end_datetime_only(self):
            # Given
            offer = create_offer_with_thing_product(Venue())
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'endDatetime': serialize(beginningDatetime)
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['global'] == [
                'Impossible de mettre des dates de début et fin si l\'offre ne porte pas sur un évenement'
            ]

    class OfferIsOnEventTest:
        def test_raises_error_with_missing_end_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'beginningDatetime': serialize(beginningDatetime)
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['endDatetime'] == [
                'Ce paramètre est obligatoire'
            ]

        def test_raises_error_with_none_end_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'beginningDatetime': serialize(beginningDatetime),
                'endDatetime': None
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['endDatetime'] == [
                'Ce paramètre est obligatoire'
            ]

        def test_raises_error_with_missing_beginning_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            beginningDatetime = datetime(2019, 2, 14)

            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'endDatetime': serialize(beginningDatetime)
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['beginningDatetime'] == [
                'Ce paramètre est obligatoire'
            ]

        def test_raises_error_with_none_beginning_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            data = {
                'price': 0,
                'offerId': humanize(offer.id),
                'beginningDatetime': None,
                'endDatetime': serialize(datetime(2019, 2, 14))
            }

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_new_stock(data, offer)

            # Then
            assert e.value.errors['beginningDatetime'] == [
                'Ce paramètre est obligatoire'
            ]


class CheckDatesAreAllowedOnExistingStockTest:
    class OfferIsOnThingTest:
        def test_raises_error_with_beginning_datetime_only(self):
            # Given
            offer = create_offer_with_thing_product(Venue())
            data = {'beginningDatetime': serialize(datetime(2019, 2, 14))}

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_existing_stock(data, offer)

            # Then
            assert e.value.errors['global'] == [
                'Impossible de mettre des dates de début et fin si l\'offre ne porte pas sur un évenement'
            ]

        def test_raises_error_with_end_datetime_only(self):
            # Given
            offer = create_offer_with_thing_product(Venue())
            data = {'endDatetime': serialize(datetime(2019, 2, 14))}

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_existing_stock(data, offer)

            # Then
            assert e.value.errors['global'] == [
                'Impossible de mettre des dates de début et fin si l\'offre ne porte pas sur un évenement'
            ]

    class OfferIsOnEventTest:
        def test_raises_error_with_none_beginning_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            data = {'beginningDatetime': None}

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_existing_stock(data, offer)

            # Then
            assert e.value.errors['beginningDatetime'] == [
                'Ce paramètre est obligatoire'
            ]

        def test_raises_error_with_none_end_datetime(self):
            # Given
            offer = create_offer_with_event_product()
            data = {'endDatetime': None}

            # When
            with pytest.raises(ApiErrors) as e:
                check_dates_are_allowed_on_existing_stock(data, offer)

            # Then
            assert e.value.errors['endDatetime'] == [
                'Ce paramètre est obligatoire'
            ]
