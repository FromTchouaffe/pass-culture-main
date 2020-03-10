import os
from unittest.mock import patch, MagicMock

import redis

from connectors.redis import add_offer_id, get_offer_ids, delete_offer_ids, \
    add_venue_id, \
    get_venue_ids, delete_venue_ids, _add_venue_provider, get_venue_providers, \
    delete_venue_providers, send_venue_provider_data_to_redis, add_to_indexed_offers, \
    delete_indexed_offers, \
    check_offer_exists, get_offer_details, delete_all_indexed_offers, add_venue_provider_currently_in_sync, \
    delete_venue_provider_currently_in_sync, get_number_of_venue_providers_currently_in_sync, add_offer_ids_in_error, \
    get_offer_ids_in_error, delete_offer_ids_in_error
from repository import repository
from tests.conftest import clean_database
from tests.model_creators.generic_creators import create_venue_provider, create_venue, create_user, create_offerer, \
    create_user_offerer, create_provider


class RedisTest:
    @staticmethod
    def test_api_writes_value_in_redis():
        # Given
        key_to_insert = 'foo'
        value_to_insert = 'bar'
        redis_url = os.environ.get('REDIS_URL')
        redis_connection = redis.from_url(redis_url)

        # When
        redis_connection.set(key_to_insert, value_to_insert)

        # Then
        assert str(redis_connection.get(key_to_insert), 'utf-8') == value_to_insert


class AddOfferIdTest:
    @patch('connectors.redis.redis')
    def test_should_add_offer_id(self, mock_redis):
        # Given
        client = MagicMock()
        client.rpush = MagicMock()

        # When
        add_offer_id(client=client, offer_id=1)

        # Then
        client.rpush.assert_called_once_with('offer_ids', 1)


class GetOfferIdsTest:
    @patch('connectors.redis.REDIS_OFFER_IDS_CHUNK_SIZE', return_value=1000)
    @patch('connectors.redis.redis')
    def test_should_return_offer_ids_from_list(self, mock_redis, mock_redis_lrange_end):
        # Given
        client = MagicMock()
        client.lrange = MagicMock()

        # When
        get_offer_ids(client=client)

        # Then
        client.lrange.assert_called_once_with('offer_ids', 0, mock_redis_lrange_end)


class DeleteOfferIdsTest:
    @patch('connectors.redis.REDIS_OFFER_IDS_CHUNK_SIZE', return_value=500)
    @patch('connectors.redis.redis')
    def test_should_delete_given_range_of_offer_ids_from_redis(self,
                                                               mock_redis,
                                                               mock_redis_lrange_end):
        # Given
        client = MagicMock()
        client.ltrim = MagicMock()

        # When
        delete_offer_ids(client=client)

        # Then
        client.ltrim.assert_called_once_with('offer_ids', mock_redis_lrange_end, -1)


class AddVenueIdTest:
    @patch('connectors.redis.redis')
    def test_should_add_venue_id_when_algolia_feature_is_enabled(self, mock_redis):
        # Given
        client = MagicMock()
        client.rpush = MagicMock()

        # When
        add_venue_id(client=client, venue_id=1)

        # Then
        client.rpush.assert_called_once_with('venue_ids', 1)


class GetVenueIdsTest:
    @patch('connectors.redis.REDIS_VENUE_IDS_CHUNK_SIZE', return_value=1000)
    @patch('connectors.redis.redis')
    def test_should_return_venue_ids_from_list(self, mock_redis, mock_redis_lrange_end):
        # Given
        client = MagicMock()
        client.lrange = MagicMock()

        # When
        get_venue_ids(client=client)

        # Then
        client.lrange.assert_called_once_with('venue_ids', 0, mock_redis_lrange_end)


class DeleteVenueIdsTest:
    @patch('connectors.redis.REDIS_VENUE_IDS_CHUNK_SIZE', return_value=1000)
    @patch('connectors.redis.redis')
    def test_should_delete_given_venue_ids_from_list(self, mock_redis, mock_redis_lrange_end):
        # Given
        client = MagicMock()
        client.ltrim = MagicMock()

        # When
        delete_venue_ids(client=client)

        # Then
        client.ltrim.assert_called_once_with('venue_ids', mock_redis_lrange_end, -1)


class AddVenueProviderTest:
    @patch('connectors.redis.redis')
    @clean_database
    def test_should_add_venue_provider(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.rpush = MagicMock()
        provider = create_provider(idx=1, local_class='OpenAgenda', is_active=False, is_enable_for_pro=False)
        user = create_user()
        offerer = create_offerer()
        user_offerer = create_user_offerer(user=user, offerer=offerer)
        venue = create_venue(idx=1, offerer=offerer)
        venue_provider = create_venue_provider(idx=1, provider=provider, venue=venue)
        repository.save(user_offerer, venue_provider)

        # When
        _add_venue_provider(client=client, venue_provider=venue_provider)

        # Then
        client.rpush.assert_called_once_with('venue_providers',
                                             '{"id": 1, "providerId": 1, "venueId": 1}')

    @patch('connectors.redis._add_venue_provider')
    @patch('connectors.redis.redis')
    @clean_database
    def test_send_venue_provider_should_call_add_venue_provider_with_redis_client_and_venue_provider(self,
                                                                                                     mock_redis,
                                                                                                     mock_add_venue_provider,
                                                                                                     app):
        # Given
        mock_redis.from_url = MagicMock()
        mock_redis.from_url.return_value = MagicMock()
        provider = create_provider(idx=1, local_class='OpenAgenda', is_active=False, is_enable_for_pro=False)
        offerer = create_offerer()
        venue = create_venue(idx=1, offerer=offerer)
        venue_provider = create_venue_provider(idx=1, provider=provider, venue=venue)
        repository.save(venue_provider)

        # When
        send_venue_provider_data_to_redis(venue_provider=venue_provider)

        # Then
        mock_add_venue_provider.assert_called_once_with(client=mock_redis.from_url.return_value,
                                                        venue_provider=venue_provider)


class GetVenueProvidersTest:
    @patch('connectors.redis.REDIS_VENUE_PROVIDERS_CHUNK_SIZE', 2)
    @patch('connectors.redis.redis')
    def test_should_return_venue_providers_from_list(self, mock_redis):
        # Given
        client = MagicMock()
        client.lrange = MagicMock()
        client.lrange.return_value = [
            '{"id": 1, "providerId": 2, "venueId": 3}',
            '{"id": 2, "providerId": 7, "venueId": 9}'
        ]

        # When
        result = get_venue_providers(client=client)

        # Then
        client.lrange.assert_called_once_with('venue_providers', 0, 2)
        assert result == [
            {'id': 1, 'providerId': 2, 'venueId': 3},
            {'id': 2, 'providerId': 7, 'venueId': 9}
        ]


class DeleteVenueProvidersTest:
    @patch('connectors.redis.REDIS_VENUE_PROVIDERS_CHUNK_SIZE', 2)
    @patch('connectors.redis.redis')
    def test_should_delete_venue_providers(self, mock_redis):
        # Given
        client = MagicMock()
        client.ltrim = MagicMock()

        # When
        delete_venue_providers(client=client)

        # Then
        client.ltrim.assert_called_once_with('venue_providers', 2, -1)


class AddToIndexedOffersTest:
    @patch('connectors.redis.redis')
    def test_should_add_to_indexed_offers(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hset = MagicMock()

        # When
        add_to_indexed_offers(pipeline=client,
                              offer_id=1,
                              offer_details={'dateRange': ['2020-01-01 10:00:00', '2020-01-06 12:00:00'],
                                             'name': 'super offre'})

        # Then
        client.hset.assert_called_once_with(
            'indexed_offers',
            1,
            '{"dateRange": ["2020-01-01 10:00:00", "2020-01-06 12:00:00"], "name": "super offre"}'
        )


class DeleteIndexedOffersTest:
    @patch('connectors.redis.redis')
    @clean_database
    def test_should_delete_indexed_offers(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hdel = MagicMock()
        offer_ids = [1, 2, 3]

        # When
        delete_indexed_offers(client=client, offer_ids=offer_ids)

        # Then
        client.hdel.assert_called_once_with('indexed_offers', *offer_ids)


class CheckOfferExistsTest:
    @patch('connectors.redis.redis')
    def test_should_return_true_when_offer_exists(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hexists = MagicMock()
        client.hexists.return_value = True

        # When
        result = check_offer_exists(client=client, offer_id=1)

        # Then
        client.hexists.assert_called_once_with('indexed_offers', 1)
        assert result

    @patch('connectors.redis.redis')
    def test_should_return_false_when_offer_not_exists(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hexists = MagicMock()
        client.hexists.return_value = False

        # When
        result = check_offer_exists(client=client, offer_id=1)

        # Then
        client.hexists.assert_called_once_with('indexed_offers', 1)
        assert not result


class GetOfferDetailsTest:
    @patch('connectors.redis.redis')
    def test_should_return_offer_details_when_offer_exists(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hget = MagicMock()
        client.hget.return_value = '{"dateRange": ["2020-01-01 10:00:00", "2020-01-06 12:00:00"], "name": "super offre"}'

        # When
        result = get_offer_details(client=client, offer_id=1)

        # Then
        client.hget.assert_called_once_with('indexed_offers', 1)
        assert result == {'dateRange': ["2020-01-01 10:00:00", "2020-01-06 12:00:00"], 'name': 'super offre'}

    @patch('connectors.redis.redis')
    def test_should_return_empty_dict_when_offer_does_exists(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hget = MagicMock()
        client.hget.return_value = None

        # When
        result = get_offer_details(client=client, offer_id=1)

        # Then
        client.hget.assert_called_once_with('indexed_offers', 1)
        assert result == {}


class DeleteAllIndexedOffersTest:
    @patch('connectors.redis.redis')
    def test_should_delete_all_indexed_offers(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.delete = MagicMock()

        # When
        delete_all_indexed_offers(client=client)

        # Then
        client.delete.assert_called_once_with('indexed_offers')


class AddVenueProviderCurrentlyInSyncTest:
    @patch('connectors.redis.redis')
    def test_should_add_venue_provider_currently_in_sync_to_hashmap(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hset = MagicMock()

        # When
        add_venue_provider_currently_in_sync(client=client, venue_provider_id=1, container_id='azerty123')

        # Then
        client.hset.assert_called_once_with('venue_providers_in_sync', 1, 'azerty123')


class DeleteVenueProviderCurrentlyInSyncTest:
    @patch('connectors.redis.redis')
    def test_should_retrieve_container_id_of_venue_provider_currently_in_sync(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hget = MagicMock()
        client.hdel = MagicMock()

        # When
        delete_venue_provider_currently_in_sync(client=client, venue_provider_id=1)

        # Then
        client.hget.assert_called_once_with('venue_providers_in_sync', 1)

    @patch('connectors.redis.redis')
    def test_should_delete_venue_provider_currently_in_sync_from_hashmap(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hget = MagicMock()
        client.hget.return_value = 'azerty123'
        client.hdel = MagicMock()

        # When
        delete_venue_provider_currently_in_sync(client=client, venue_provider_id=1)

        # Then
        client.hdel.assert_called_once_with('venue_providers_in_sync', 1)


class GetNumberOfVenueProvidersCurrentlyInSync:
    @patch('connectors.redis.redis')
    def test_should_return_number_of_venue_providers_currently_in_sync(self, mock_redis, app):
        # Given
        client = MagicMock()
        client.hlen = MagicMock()
        client.hlen.return_value = 10

        # When
        number_of_venue_providers_currently_in_sync = get_number_of_venue_providers_currently_in_sync(client=client)

        # Then
        client.hlen.assert_called_once_with('venue_providers_in_sync')
        assert number_of_venue_providers_currently_in_sync == 10


class AddOfferIdInErrorTest:
    @patch('connectors.redis.redis')
    def test_should_add_offer_id_in_error(self, mock_redis):
        # Given
        client = MagicMock()
        client.rpush = MagicMock()

        # When
        add_offer_ids_in_error(client=client, offer_ids=[1, 2])

        # Then
        client.rpush.assert_called_once_with('offer_ids_in_error', [1, 2])


class GetOfferIdsInErrorTest:
    @patch('connectors.redis.redis')
    def test_should_get_offer_ids_in_error(self, mock_redis):
        # Given
        client = MagicMock()
        client.lrange = MagicMock()

        # When
        get_offer_ids_in_error(client=client)

        # Then
        client.lrange.assert_called_once_with('offer_ids_in_error', 0, 1000)


class DeleteOfferIdsInErrorTest:
    @patch('connectors.redis.REDIS_OFFER_IDS_IN_ERROR_CHUNK_SIZE', return_value=1000)
    @patch('connectors.redis.redis')
    def test_should_delete_given_range_of_offer_ids_in_error(self, mock_redis, mock_redis_lrange_end):
        # Given
        client = MagicMock()
        client.ltrim = MagicMock()

        # When
        delete_offer_ids_in_error(client=client)

        # Then
        client.ltrim.assert_called_once_with('offer_ids_in_error', mock_redis_lrange_end, -1)
