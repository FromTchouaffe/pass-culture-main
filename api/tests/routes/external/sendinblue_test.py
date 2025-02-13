import logging

import pytest

from pcapi.core.testing import override_settings
from pcapi.core.users.factories import UserFactory
from pcapi.models import db


class SubscribeOrUnsubscribeUserTestHelper:
    # attributes overriden in inherited test classes
    endpoint = NotImplemented
    initial_marketing_email = NotImplemented
    expected_marketing_email = NotImplemented

    def test_webhook_ok(self, client):
        # Given
        existing_user = UserFactory(
            email="lucy.ellingson@kennet.ca",
            notificationSubscriptions={"marketing_push": True, "marketing_email": self.initial_marketing_email},
        )
        headers = {"X-Forwarded-For": "185.107.232.1"}
        data = {"email": "lucy.ellingson@kennet.ca"}
        assert existing_user.notificationSubscriptions["marketing_email"] is self.initial_marketing_email

        # When
        with override_settings(IS_DEV=False):  # enforce source IP check
            response = client.post(self.endpoint, json=data, headers=headers)

        # Then
        assert response.status_code == 204
        db.session.refresh(existing_user)
        assert existing_user.notificationSubscriptions["marketing_email"] is self.expected_marketing_email

    def test_webhook_from_forbidden_ip(self, client):
        # Given
        existing_user = UserFactory(
            email="lucy.ellingson@kennet.ca",
            notificationSubscriptions={"marketing_push": True, "marketing_email": self.initial_marketing_email},
        )
        assert existing_user.notificationSubscriptions["marketing_email"] is self.initial_marketing_email

        headers = {"X-Forwarded-For": "127.0.0.1"}
        data = {"email": "lucy.ellingson@kennet.ca"}

        # When
        with override_settings(IS_DEV=False):  # enforce source IP check
            response = client.post(self.endpoint, json=data, headers=headers)

        # Then
        assert response.status_code == 401
        db.session.refresh(existing_user)
        assert existing_user.notificationSubscriptions["marketing_email"] is self.initial_marketing_email

    def test_webhook_bad_request(self, client):
        # Given
        existing_user = UserFactory(
            email="lucy.ellingson@kennet.ca",
            notificationSubscriptions={"marketing_push": True, "marketing_email": self.initial_marketing_email},
        )
        assert existing_user.notificationSubscriptions["marketing_email"] is self.initial_marketing_email

        headers = {"X-Forwarded-For": "185.107.232.1"}
        data = {}

        # When
        response = client.post(self.endpoint, json=data, headers=headers)

        # Then
        assert response.status_code == 400
        db.session.refresh(existing_user)
        assert existing_user.notificationSubscriptions["marketing_email"] is self.initial_marketing_email

    def test_webhook_user_does_not_exist(self, client):
        # Given
        headers = {"X-Forwarded-For": "185.107.232.1"}
        data = {"email": "lucy.ellingson@kennet.ca"}

        # When
        response = client.post(self.endpoint, json=data, headers=headers)

        # Then
        assert response.status_code == 400


@pytest.mark.usefixtures("db_session")
class UnsubscribeUserTest(SubscribeOrUnsubscribeUserTestHelper):
    endpoint = "/webhooks/sendinblue/unsubscribe"
    initial_marketing_email = True
    expected_marketing_email = False


@pytest.mark.usefixtures("db_session")
class SubscribeUserTest(SubscribeOrUnsubscribeUserTestHelper):
    endpoint = "/webhooks/sendinblue/subscribe"
    initial_marketing_email = False
    expected_marketing_email = True


@pytest.mark.usefixtures("db_session")
class NotifyImportContactsTest:
    def test_notify_importcontacts(self, client, caplog):
        # Given
        headers = {"X-Forwarded-For": "1.179.112.9"}

        # When
        with caplog.at_level(logging.INFO):
            response = client.post("/webhooks/sendinblue/importcontacts/18/1", headers=headers)

        # Then
        assert response.status_code == 204
        assert caplog.records[0].message == "ContactsApi->import_contacts finished"
        assert caplog.records[0].extra == {
            "list_id": 18,
            "iteration": 1,
        }
