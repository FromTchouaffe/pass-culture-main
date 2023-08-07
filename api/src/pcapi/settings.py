""" config """
import base64
import json
from logging import INFO as LOG_LEVEL_INFO
import os
from pathlib import Path

from dotenv import load_dotenv
import semver

from .utils import secrets as secrets_utils
from .utils import settings as utils
from .utils.example_certificate import PRIVATE_KEY_EXAMPLE
from .utils.example_certificate import PUBLIC_CERTIFICATE_EXAMPLE


ENV = os.environ.get("ENV", "development")
IS_DEV = ENV == "development"
IS_INTEGRATION = ENV == "integration"
IS_STAGING = ENV == "staging"
IS_PROD = ENV == "production"
IS_TESTING = ENV == "testing"

if ENV not in ("development", "integration", "staging", "production", "testing"):
    raise RuntimeError("Unknown environment")

IS_RUNNING_TESTS = os.environ.get("RUN_ENV") == "tests"
IS_PERFORMANCE_TESTS = bool(int(os.environ.get("IS_PERFORMANCE_TESTS", "0")))
IS_E2E_TESTS = bool(int(os.environ.get("IS_E2E_TESTS", "0")))
assert not (IS_PROD and IS_PERFORMANCE_TESTS)

# Load configuration files
env_path = Path(f"./.env.{ENV}")
load_dotenv(dotenv_path=env_path)

if IS_DEV:
    load_dotenv(dotenv_path=".env.local.secret", override=True)
if IS_RUNNING_TESTS and not IS_E2E_TESTS:
    load_dotenv(dotenv_path=".env.testauto", override=True)

LOG_LEVEL = int(os.environ.get("LOG_LEVEL", LOG_LEVEL_INFO))


# API config
API_URL = os.environ.get("API_URL", "")


# Applications urls
WEBAPP_V2_URL = os.environ.get("WEBAPP_V2_URL")
WEBAPP_V2_REDIRECT_URL = os.environ.get("WEBAPP_V2_REDIRECT_URL")
PRO_URL = os.environ.get("PRO_URL")
FIREBASE_DYNAMIC_LINKS_URL = os.environ.get("FIREBASE_DYNAMIC_LINKS_URL")


# DATABASE
DB_MIGRATION_LOCK_TIMEOUT = int(os.environ.get("DB_MIGRATION_LOCK_TIMEOUT", 5000))
DB_MIGRATION_MAX_ATTEMPTS = int(os.environ.get("DB_MIGRATION_MAX_ATTEMPTS", 30))
DB_MIGRATION_RETRY_DELAY = int(os.environ.get("DB_MIGRATION_RETRY_DELAY", 10))
DB_MIGRATION_STATEMENT_TIMEOUT = int(os.environ.get("DB_MIGRATION_STATEMENT_TIMEOUT", 60000))
DATABASE_URL = secrets_utils.get("DATABASE_URL") if not IS_RUNNING_TESTS else os.environ.get("DATABASE_URL_TEST")
DATABASE_POOL_SIZE = int(os.environ.get("DATABASE_POOL_SIZE", 20))
DATABASE_STATEMENT_TIMEOUT = int(os.environ.get("DATABASE_STATEMENT_TIMEOUT", 0))
DATABASE_LOCK_TIMEOUT = int(os.environ.get("DATABASE_LOCK_TIMEOUT", 0))
DATABASE_IDLE_IN_TRANSACTION_SESSION_TIMEOUT = int(os.environ.get("DATABASE_IDLE_IN_TRANSACTION_SESSION_TIMEOUT", 0))
SQLALCHEMY_ECHO = bool(int(os.environ.get("SQLALCHEMY_ECHO", "0")))

# FLASK
PROFILE_REQUESTS = bool(int(os.environ.get("PROFILE_REQUESTS", "0")))
PROFILE_REQUESTS_LINES_LIMIT = int(os.environ.get("PROFILE_REQUESTS_LINES_LIMIT", 100))
FLASK_PORT = int(os.environ.get("PORT", 5001))
FLASK_SECRET = secrets_utils.get("FLASK_SECRET", "+%+3Q23!zbc+!Dd@")
CORS_ALLOWED_ORIGINS = os.environ["CORS_ALLOWED_ORIGINS"].split(",")
CORS_ALLOWED_ORIGINS_BACKOFFICE = os.environ["CORS_ALLOWED_ORIGINS_BACKOFFICE"].split(",")
CORS_ALLOWED_ORIGINS_NATIVE = os.environ["CORS_ALLOWED_ORIGINS_NATIVE"].split(",")
CORS_ALLOWED_ORIGINS_ADAGE_IFRAME = os.environ["CORS_ALLOWED_ORIGINS_ADAGE_IFRAME"].split(",")
SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")

# NATIVE APP SPECIFIC SETTINGS
NATIVE_APP_MINIMAL_CLIENT_VERSION = semver.VersionInfo.parse(
    os.environ.get("NATIVE_APP_MINIMAL_CLIENT_VERSION", "1.132.1")
)


# REDIS
REDIS_URL = secrets_utils.get("REDIS_URL", "redis://localhost:6379")
REDIS_OFFER_IDS_CHUNK_SIZE = int(os.environ.get("REDIS_OFFER_IDS_CHUNK_SIZE", 1000))
REDIS_COLLECTIVE_OFFER_IDS_CHUNK_SIZE = int(os.environ.get("REDIS_COLLECTIVE_OFFER_IDS_CHUNK_SIZE", 1000))
REDIS_COLLECTIVE_OFFER_TEMPLATE_IDS_CHUNK_SIZE = int(
    os.environ.get("REDIS_COLLECTIVE_OFFER_TEMPLATE_IDS_CHUNK_SIZE", 1000)
)
REDIS_VENUE_IDS_FOR_OFFERS_CHUNK_SIZE = int(os.environ.get("REDIS_VENUE_IDS_FOR_OFFERS_CHUNK_SIZE", 1000))
REDIS_VENUE_IDS_CHUNK_SIZE = int(os.environ.get("REDIS_VENUE_IDS_CHUNK_SIZE", 1000))


# SENTRY
SENTRY_DSN = secrets_utils.get("SENTRY_DSN", "")
SENTRY_SAMPLE_RATE = float(os.environ.get("SENTRY_SAMPLE_RATE", 0))


# USERS
MAX_FAVORITES = int(os.environ.get("MAX_FAVORITES", 100))  # 0 is unlimited
MAX_API_KEY_PER_OFFERER = int(os.environ.get("MAX_API_KEY_PER_OFFERER", 5))
USE_FAST_AND_INSECURE_PASSWORD_HASHING_ALGORITHM = bool(
    int(os.environ.get("USE_FAST_AND_INSECURE_PASSWORD_HASHING_ALGORITHM", False))
)


# MAIL
COMPLIANCE_EMAIL_ADDRESS = secrets_utils.get("COMPLIANCE_EMAIL_ADDRESS", "")
FRAUD_EMAIL_ADDRESS = secrets_utils.get("FRAUD_EMAIL_ADDRESS", "")
DEV_EMAIL_ADDRESS = secrets_utils.get("DEV_EMAIL_ADDRESS")
END_TO_END_TESTS_EMAIL_ADDRESS = os.environ.get("END_TO_END_TESTS_EMAIL_ADDRESS", "")

# When load testing, override `EMAIL_BACKEND` to avoid going over SendinBlue quota:
# EMAIL_BACKEND="pcapi.core.mails.backends.logger.LoggerBackend"
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND")

REPORT_OFFER_EMAIL_ADDRESS = secrets_utils.get("REPORT_OFFER_EMAIL_ADDRESS", "")
SUPER_ADMIN_EMAIL_ADDRESSES = utils.parse_str_to_list(secrets_utils.get("SUPER_ADMIN_EMAIL_ADDRESSES"))
SUPPORT_EMAIL_ADDRESS = secrets_utils.get("SUPPORT_EMAIL_ADDRESS", "")
SUPPORT_PRO_EMAIL_ADDRESS = secrets_utils.get("SUPPORT_PRO_EMAIL_ADDRESS", "")
WHITELISTED_EMAIL_RECIPIENTS = utils.parse_str_to_list(secrets_utils.get("WHITELISTED_EMAIL_RECIPIENTS"))
WHITELISTED_SMS_RECIPIENTS = utils.parse_phone_numbers(secrets_utils.get("WHITELISTED_SMS_RECIPIENTS"))

# NOTIFICATIONS
INTERNAL_NOTIFICATION_BACKEND = os.environ.get("INTERNAL_NOTIFICATION_BACKEND")
PUSH_NOTIFICATION_BACKEND = os.environ.get("PUSH_NOTIFICATION_BACKEND")
SMS_NOTIFICATION_BACKEND = os.environ.get("SMS_NOTIFICATION_BACKEND")

MAX_SMS_SENT_FOR_PHONE_VALIDATION = int(os.environ.get("MAX_SMS_SENT_FOR_PHONE_VALIDATION", 3))
MAX_PHONE_VALIDATION_ATTEMPTS = int(os.environ.get("MAX_PHONE_VALIDATION_ATTEMPTS", 3))

SENT_SMS_COUNTER_TTL = int(os.environ.get("SENT_SMS_COUNTER_TTL", 12 * 60 * 60))
PHONE_VALIDATION_ATTEMPTS_TTL = int(os.environ.get("PHONE_VALIDATION_ATTEMPTS_TTL", 30 * 24 * 60 * 60))

# ALGOLIA
ALGOLIA_API_KEY = secrets_utils.get("ALGOLIA_API_KEY", "dummy-key")
ALGOLIA_APPLICATION_ID = secrets_utils.get("ALGOLIA_APPLICATION_ID", "dummy-app-id")
ALGOLIA_OFFERS_INDEX_NAME = os.environ.get("ALGOLIA_OFFERS_INDEX_NAME")
ALGOLIA_COLLECTIVE_OFFERS_INDEX_NAME = os.environ.get("ALGOLIA_COLLECTIVE_OFFERS_INDEX_NAME")
ALGOLIA_VENUES_INDEX_NAME = os.environ.get("ALGOLIA_VENUES_INDEX_NAME")
ALGOLIA_TRIGGER_INDEXATION = bool(int(os.environ.get("ALGOLIA_TRIGGER_INDEXATION", "0")))
ALGOLIA_DELETING_OFFERS_CHUNK_SIZE = int(os.environ.get("ALGOLIA_DELETING_OFFERS_CHUNK_SIZE", 10000))
ALGOLIA_DELETING_COLLECTIVE_OFFERS_CHUNK_SIZE = int(
    os.environ.get("ALGOLIA_DELETING_COLLECTIVE_OFFERS_CHUNK_SIZE", 10000)
)
ALGOLIA_OFFERS_BY_VENUE_CHUNK_SIZE = int(os.environ.get("ALGOLIA_OFFERS_BY_VENUE_CHUNK_SIZE", 10000))
ALGOLIA_LAST_30_DAYS_BOOKINGS_RANGE_THRESHOLDS = [
    int(value) for value in secrets_utils.get("ALGOLIA_LAST_30_DAYS_BOOKINGS_RANGE_THRESHOLDS", "1,2,3,4").split(",")
]

# BATCH
BATCH_ANDROID_API_KEY = os.environ.get("BATCH_ANDROID_API_KEY", "")
BATCH_IOS_API_KEY = os.environ.get("BATCH_IOS_API_KEY", "")
BATCH_SECRET_API_KEY = secrets_utils.get("BATCH_SECRET_API_KEY", "")
BATCH_MAX_USERS_PER_TRANSACTIONAL_NOTIFICATION = int(
    os.environ.get("BATCH_MAX_USERS_PER_TRANSACTIONAL_NOTIFICATION", 1_000)
)

# BEAMER
BEAMER_API_KEY = secrets_utils.get("BEAMER_API_KEY", "")
BEAMER_BACKEND = os.environ.get("BEAMER_BACKEND")

# SENDINBLUE
SENDINBLUE_API_KEY = secrets_utils.get("SENDINBLUE_API_KEY", "")
SENDINBLUE_PRO_CONTACT_LIST_ID = int(os.environ.get("SENDINBLUE_PRO_CONTACT_LIST_ID", 12))
SENDINBLUE_YOUNG_CONTACT_LIST_ID = int(os.environ.get("SENDINBLUE_YOUNG_CONTACT_LIST_ID", 4))
SENDINBLUE_AUTOMATION_YOUNG_18_IN_1_MONTH_LIST_ID = int(
    os.environ.get("SENDINBLUE_AUTOMATION_YOUNG_18_IN_1_MONTH_LIST_ID", 22)
)
SENDINBLUE_AUTOMATION_YOUNG_INACTIVE_30_DAYS_LIST_ID = int(
    os.environ.get("SENDINBLUE_AUTOMATION_YOUNG_INACTIVE_30_DAYS_LIST_ID", 20)
)
SENDINBLUE_AUTOMATION_YOUNG_1_YEAR_WITH_PASS_LIST_ID = int(
    os.environ.get("SENDINBLUE_AUTOMATION_YOUNG_1_YEAR_WITH_PASS_LIST_ID", 21)
)
SENDINBLUE_AUTOMATION_YOUNG_EXPIRATION_M3_ID = int(os.environ.get("SENDINBLUE_AUTOMATION_YOUNG_EXPIRATION_M3_ID", 23))
SENDINBLUE_AUTOMATION_YOUNG_EX_BENEFICIARY_ID = int(os.environ.get("SENDINBLUE_AUTOMATION_YOUNG_EX_BENEFICIARY_ID", 24))
SENDINBLUE_PRO_INACTIVE_90_DAYS_ID = int(os.environ.get("SENDINBLUE_PRO_INACTIVE_90_DAYS_ID", 35))
SENDINBLUE_PRO_NO_ACTIVE_OFFERS_40_DAYS_ID = int(os.environ.get("SENDINBLUE_PRO_NO_ACTIVE_OFFERS_40_DAYS_ID", 545))

# RECAPTCHA
RECAPTCHA_RESET_PASSWORD_MINIMAL_SCORE = float(os.environ.get("RECAPTCHA_RESET_PASSWORD_MINIMAL_SCORE", 0.7))
RECAPTCHA_API_URL = "https://www.google.com/recaptcha/api/siteverify"
RECAPTCHA_SECRET = secrets_utils.get("RECAPTCHA_SECRET")
NATIVE_RECAPTCHA_SECRET = secrets_utils.get("NATIVE_RECAPTCHA_SECRET")
RECAPTCHA_IGNORE_VALIDATION = bool(int(os.environ.get("RECAPTCHA_IGNORE_VALIDATION", 0)))


# JWT
JWT_SECRET_KEY = secrets_utils.get("JWT_SECRET_KEY")
# default is 15 minutes
# https://flask-jwt-extended.readthedocs.io/en/stable/options/#JWT_ACCESS_TOKEN_EXPIRES
JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 60 * 15))
# default is 1 month
JWT_REFRESH_TOKEN_EXPIRES = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 31 * 24 * 60 * 60))
# default is 1 year
JWT_REFRESH_TOKEN_EXTENDED_EXPIRES = int(os.environ.get("JWT_REFRESH_TOKEN_EXTENDED_EXPIRES", 366 * 24 * 60 * 60))


# TITELIVE
TITELIVE_FTP_URI = secrets_utils.get("FTP_TITELIVE_URI")
TITELIVE_FTP_USER = secrets_utils.get("FTP_TITELIVE_USER")
TITELIVE_FTP_PWD = secrets_utils.get("FTP_TITELIVE_PWD")
TITELIVE_EPAGINE_API_AUTH_URL = "https://login.epagine.fr/v1"
TITELIVE_EPAGINE_API_URL = "https://catsearch.epagine.fr/v1"
TITELIVE_EPAGINE_API_USERNAME = secrets_utils.get("TITELIVE_EPAGINE_API_USERNAME", "")
TITELIVE_EPAGINE_API_PASSWORD = secrets_utils.get("TITELIVE_EPAGINE_API_PASSWORD", "")

# UBBLE
UBBLE_API_URL = os.environ.get("UBBLE_API_URL", "https://api.ubble.ai")
UBBLE_CLIENT_ID = secrets_utils.get("UBBLE_CLIENT_ID", "")
UBBLE_CLIENT_SECRET = secrets_utils.get("UBBLE_CLIENT_SECRET", "")
UBBLE_WEBHOOK_SECRET = secrets_utils.get("UBBLE_WEBHOOK_SECRET")
UBBLE_SUBSCRIPTION_LIMITATION_DAYS = os.environ.get("UBBLE_SUBSCRIPTION_LIMITATION_DAYS", 90)
DAYS_BEFORE_UBBLE_QUICK_ACTION_REMINDER = 7 if IS_PROD else 0
DAYS_BEFORE_UBBLE_LONG_ACTION_REMINDER = 21 if IS_PROD else 0

# Sandbox users and unit tests default password - overridden by a secret password on cloud environments
TEST_DEFAULT_PASSWORD = secrets_utils.get("TEST_DEFAULT_PASSWORD", "user@AZERTY123")

# Test users on staging
IMPORT_USERS_GOOGLE_DOCUMENT_ID = secrets_utils.get("IMPORT_USERS_GOOGLE_DOCUMENT_ID", "")


# PROVIDERS
ALLOCINE_API_KEY = secrets_utils.get("ALLOCINE_API_KEY")
CDS_API_URL = secrets_utils.get("CDS_API_URL")
CGR_API_USER = secrets_utils.get("CGR_API_USER")
CGR_API_PASSWORD = secrets_utils.get("CGR_API_PASSWORD")
CGR_API_URL = secrets_utils.get("CGR_API_URL")
EMS_API_URL = secrets_utils.get("EMS_API_URL")
EMS_API_USER = secrets_utils.get("EMS_API_USER")
EMS_API_PASSWORD = secrets_utils.get("EMS_API_PASSWORD")


# DEMARCHES SIMPLIFIEES
DMS_VENUE_PROCEDURE_ID_V2 = os.environ.get("DEMARCHES_SIMPLIFIEES_RIB_VENUE_PROCEDURE_ID_V2")
DMS_VENUE_PROCEDURE_ID_V3 = os.environ.get("DEMARCHES_SIMPLIFIEES_RIB_VENUE_PROCEDURE_ID_V3")
DMS_VENUE_PROCEDURE_ID_V4 = os.environ.get("DEMARCHES_SIMPLIFIEES_RIB_VENUE_PROCEDURE_ID_V4")
DMS_TOKEN = secrets_utils.get("DEMARCHES_SIMPLIFIEES_TOKEN")
DMS_EAC_PROCEDURE_INDEPENDANTS_CANDIDATE_ID = int(
    os.environ.get("DEMARCHES_SIMPLIFIEES_EAC_PROCEDURE_INDEPENDANTS_CANDIDATE_ID", 0)
)
DMS_EAC_PROCEDURE_MENJS_CANDIDATE_ID = int(os.environ.get("DEMARCHES_SIMPLIFIEES_EAC_PROCEDURE_MENJS_CANDIDATE_ID", 0))
DMS_EAC_PROCEDURE_STRUCTURE_CANDIDATE_ID = int(
    os.environ.get("DEMARCHES_SIMPLIFIEES_EAC_PROCEDURE_STRUCTURE_CANDIDATE_ID", 0)
)
DMS_ENROLLMENT_INSTRUCTOR = os.environ.get("DEMARCHES_SIMPLIFIEES_ENROLLMENT_INSTRUCTOR", "")
DMS_ENROLLMENT_PROCEDURE_ID_FR = int(os.environ.get("DEMARCHES_SIMPLIFIEES_ENROLLMENT_PROCEDURE_ID_FR", 1))
DMS_ENROLLMENT_PROCEDURE_ID_ET = int(os.environ.get("DEMARCHES_SIMPLIFIEES_ENROLLMENT_PROCEDURE_ID_ET", 2))
DMS_WEBHOOK_TOKEN = secrets_utils.get("DEMARCHES_SIMPLIFIEES_WEBHOOK_TOKEN")
DMS_INACTIVITY_TOLERANCE_DELAY = int(os.environ.get("DEMARCHES_SIMPLIFIEES_INACTIVITY_TOLERANCE_DELAY", "90"))
DMS_INSTRUCTOR_ID = secrets_utils.get("DEMARCHES_SIMPLIFIEES_INSTRUCTOR_ID", "")

# OBJECT STORAGE
OBJECT_STORAGE_URL = os.environ.get("OBJECT_STORAGE_URL", "")
OBJECT_STORAGE_PROVIDER = os.environ.get("OBJECT_STORAGE_PROVIDER")
LOCAL_STORAGE_DIR = Path(os.path.dirname(os.path.realpath(__file__))) / "static" / "object_store_data"

# THUMBS
THUMBS_FOLDER_NAME = os.environ.get("THUMBS_FOLDER_NAME", "thumbs")

# GOOGLE
GCP_BUCKET_CREDENTIALS = json.loads(base64.b64decode(secrets_utils.get("GCP_BUCKET_CREDENTIALS", "")) or "{}")
GCP_BUCKET_NAME = os.environ.get("GCP_BUCKET_NAME", "")
GCP_ALTERNATE_BUCKET_NAME = os.environ.get("GCP_ALTERNATE_BUCKET_NAME", "")
GCP_DATA_BUCKET_NAME = secrets_utils.get("GCP_DATA_BUCKET_NAME", "")
GCP_DATA_PROJECT_ID = secrets_utils.get("GCP_DATA_PROJECT_ID", "")
GCP_CULTURAL_SURVEY_ANSWERS_QUEUE_NAME = os.environ.get("GCP_CULTURAL_SURVEY_ANSWERS_QUEUE_NAME", "")
GCP_PROJECT = os.environ.get("GCP_PROJECT", "")
GCP_REGION_CLOUD_TASK = os.environ.get("GCP_REGION_CLOUD_TASK", "europe-west3")
GCP_BEAMER_PRO_QUEUE_NAME = os.environ.get("GCP_BEAMER_PRO_QUEUE_NAME")
GCP_SENDINBLUE_CONTACTS_QUEUE_NAME = os.environ.get("GCP_SENDINBLUE_CONTACTS_QUEUE_NAME")
GCP_SENDINBLUE_PRO_QUEUE_NAME = os.environ.get("GCP_SENDINBLUE_PRO_QUEUE_NAME")
GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_PRIMARY_QUEUE_NAME = os.environ.get(
    "GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_PRIMARY_QUEUE_NAME"
)
GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_SECONDARY_QUEUE_NAME = os.environ.get(
    "GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_SECONDARY_QUEUE_NAME"
)
GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_WITHDRAWAL_UPDATED_QUEUE_NAME = os.environ.get(
    "GCP_SENDINBLUE_TRANSACTIONAL_EMAILS_WITHDRAWAL_UPDATED_QUEUE_NAME"
)
GCP_BATCH_CUSTOM_DATA_QUEUE_NAME = os.environ.get("GCP_BATCH_CUSTOM_DATA_QUEUE_NAME")
GCP_BATCH_CUSTOM_DATA_ANDROID_QUEUE_NAME = os.environ.get("GCP_BATCH_CUSTOM_DATA_ANDROID_QUEUE_NAME")
GCP_BATCH_CUSTOM_DATA_IOS_QUEUE_NAME = os.environ.get("GCP_BATCH_CUSTOM_DATA_IOS_QUEUE_NAME")
GCP_SYNCHRONIZE_VENUE_PROVIDERS_QUEUE_NAME = os.environ.get("GCP_SYNCHRONIZE_VENUE_PROVIDERS_QUEUE_NAME")
GCP_UBBLE_ARCHIVE_ID_PICTURES_QUEUE_NAME = os.environ.get("GCP_UBBLE_ARCHIVE_ID_PICTURES_QUEUE_NAME")
GCP_ZENDESK_ATTRIBUTES_QUEUE_NAME = os.environ.get("GCP_ZENDESK_ATTRIBUTES_QUEUE_NAME")
GCP_ZENDESK_SELL_QUEUE_NAME = os.environ.get("GCP_ZENDESK_SELL_QUEUE_NAME")

GCP_BATCH_NOTIFICATION_QUEUE_NAME = os.environ.get("GCP_BATCH_NOTIFICATION_QUEUE_NAME", "")
GCP_BATCH_CUSTOM_EVENT_QUEUE_NAME = os.environ.get("GCP_BATCH_CUSTOM_EVENT_QUEUE_NAME", "")

CLOUD_TASK_BEARER_TOKEN = secrets_utils.get("CLOUD_TASK_BEARER_TOKEN", "")
assert not (IS_PROD and not CLOUD_TASK_BEARER_TOKEN), "CLOUD_TASK_BEARER_TOKEN is required in production"
CLOUD_TASK_MAX_ATTEMPTS = int(os.environ.get("CLOUD_TASK_MAX_ATTEMPTS", 10))  # as 2022-8-8 in place for all cloud tasks

CLOUD_TASK_RETRY_INITIAL_DELAY = float(os.environ.get("CLOUD_TASK_RETRY_INITIAL_DELAY", 1.0))
CLOUD_TASK_RETRY_MAXIMUM_DELAY = float(os.environ.get("CLOUD_TASK_RETRY_MAXIMUM_DELAY", 60.0))
CLOUD_TASK_RETRY_MULTIPLIER = float(os.environ.get("CLOUD_TASK_RETRY_MULTIPLIER", 2.0))
CLOUD_TASK_RETRY_DEADLINE = float(os.environ.get("CLOUD_TASK_RETRY_DEADLINE", 60.0 * 2.0))

GOOGLE_CLIENT_ID = secrets_utils.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = secrets_utils.get("GOOGLE_CLIENT_SECRET")
GOOGLE_DRIVE_BACKEND = os.environ.get("GOOGLE_DRIVE_BACKEND")

GOOGLE_BIG_QUERY_BACKEND = os.environ.get("GOOGLE_BIG_QUERY_BACKEND")


# RATE LIMITER
RATE_LIMIT_BY_EMAIL = os.environ.get("RATE_LIMIT_BY_EMAIL", "10/minute")
RATE_LIMIT_BY_IP = os.environ.get("RATE_LIMIT_BY_IP", "10/minute")
RATE_LIMIT_SIRENE_API = os.environ.get("RATE_LIMIT_SIRENE_API", "5/minute")
RATE_LIMIT_BY_API_KEY = os.environ.get("RATE_LIMIT_BY_API_KEY", "50/minute")


# DEBUG
DEBUG_ACTIVATED = bool(int(os.environ.get("DEBUG_ACTIVATED", "0")))


# PHONE NUMBERS
BLACKLISTED_SMS_RECIPIENTS = set(secrets_utils.get("BLACKLISTED_SMS_RECIPIENTS", "").splitlines())

# SEARCH
SEARCH_BACKEND = os.environ.get("SEARCH_BACKEND")

# ADAGE
ADAGE_API_KEY = secrets_utils.get("ADAGE_API_KEY", None)
ADAGE_API_URL = os.environ.get("ADAGE_API_URL", None)
EAC_API_KEY = secrets_utils.get("EAC_API_KEY", None)
JWT_ADAGE_PUBLIC_KEY_FILENAME = os.environ.get("JWT_ADAGE_PUBLIC_KEY_FILENAME", "public_key.production")
ADAGE_BACKEND = os.environ.get("ADAGE_BACKEND", "pcapi.core.educational.adage_backends.adage.AdageHttpClient")
CAN_COLLECTIVE_OFFERER_IGNORE_ADAGE = bool(int(os.environ.get("CAN_COLLECTIVE_OFFERER_IGNORE_ADAGE", "0")))

# NOTION
NOTION_TOKEN = secrets_utils.get("NOTION_TOKEN", "")
SEND_SYNCHRONIZATION_ERRORS_TO_NOTION = bool(int(os.environ.get("SEND_SYNCHRONIZATION_ERRORS_TO_NOTION", 0)))

# EDUCONNECT
API_URL_FOR_EDUCONNECT = os.environ.get(
    "API_URL_FOR_EDUCONNECT", API_URL
)  # must match the url specified in the metadata file provided to educonnect
EDUCONNECT_SP_CERTIFICATE = secrets_utils.get("EDUCONNECT_SP_CERTIFICATE", PUBLIC_CERTIFICATE_EXAMPLE)
EDUCONNECT_SP_PRIVATE_KEY = secrets_utils.get("EDUCONNECT_SP_PRIVATE_KEY", PRIVATE_KEY_EXAMPLE)
EDUCONNECT_METADATA_FILE = os.environ.get("EDUCONNECT_METADATA_FILE", "educonnect.pr4.metadata.xml")

# PERMISSIONS
PERMISSIONS = base64.b64decode(secrets_utils.get("PERMISSIONS", "")).decode("utf-8")

# EMAIL UPDATE
MAX_EMAIL_UPDATE_ATTEMPTS = int(os.environ.get("MAX_EMAIL_UPDATE_ATTEMPTS", 3))
EMAIL_UPDATE_ATTEMPTS_TTL = int(os.environ.get("EMAIL_UPDATE_ATTEMPTS_TTL", 24 * 60 * 60 * 3))  # 3 days
EMAIL_CHANGE_TOKEN_LIFE_TIME = int(os.environ.get("EMAIL_CHANGE_TOKEN_LIFE_TIME", 24 * 60 * 60))  # 1 day


# SOON EXPIRING BOOKINGS NOTIFICATIONS
SOON_EXPIRING_BOOKINGS_DAYS_BEFORE_EXPIRATION = int(os.environ.get("SOON_EXPIRING_BOOKINGS_DAYS_BEFORE_EXPIRATION", 3))


# SLACK
SLACK_BOT_TOKEN = secrets_utils.get("SLACK_BOT_TOKEN", None)
SLACK_CHANGE_FEATURE_FLIP_CHANNEL = os.environ.get("SLACK_CHANGE_FEATURE_FLIP_CHANNEL", "feature-flip-ehp")
SLACK_REBUILD_STAGING_CHANNEL = os.environ.get("SLACK_REBUILD_STAGING_CHANNEL", "alertes-dump-restore-staging")


# OUTSCALE
OUTSCALE_ACCESS_KEY = secrets_utils.get("OUTSCALE_ACCESS_KEY", "")
OUTSCALE_SECRET_KEY = secrets_utils.get("OUTSCALE_SECRET_KEY", "")
OUTSCALE_SECNUM_BUCKET_NAME = os.environ.get("OUTSCALE_SECNUM_BUCKET_NAME", "")
OUTSCALE_REGION = os.environ.get("OUTSCALE_REGION", "cloudgouv-eu-west-1")
OUTSCALE_ENDPOINT_URL = os.environ.get("OUTSCALE_ENDPOINT_URL", "https://oos.cloudgouv-eu-west-1.outscale.com")

# ZENDESK
ZENDESK_API_URL = os.environ.get("ZENDESK_API_URL")
ZENDESK_API_EMAIL = secrets_utils.get("ZENDESK_API_EMAIL")
ZENDESK_API_TOKEN = secrets_utils.get("ZENDESK_API_TOKEN")

# ZENDESK SELL
ZENDESK_SELL_BACKEND = os.environ.get("ZENDESK_SELL_BACKEND", "pcapi.core.external.backends.zendesk.ZendeskSellBackend")
ZENDESK_SELL_API_KEY = secrets_utils.get("ZENDESK_SELL_API_KEY")
ZENDESK_SELL_API_URL = os.environ.get("ZENDESK_SELL_API_URL", "https://api.getbase.com")

# ACCOUNT (UN)SUSPENSION
DELETE_SUSPENDED_ACCOUNTS_SINCE = int(os.environ.get("DELETE_SUSPENDED_ACCOUNTS_SINCE", 61))
NOTIFY_X_DAYS_BEFORE_DELETION = int(os.environ.get("NOTIFY_X_DAYS_BEFORE_DELETION", 10))

# FINANCE
FINANCE_GOOGLE_DRIVE_ROOT_FOLDER_ID = secrets_utils.get("FINANCE_GOOGLE_DRIVE_ROOT_FOLDER_ID", "")
FINANCE_OVERRIDE_PRICING_ORDERING_ON_PRICING_POINTS = secrets_utils.getlist(
    "FINANCE_OVERRIDE_PRICING_ORDERING_ON_PRICING_POINTS",
    type_=int,
)

# BACKOFFICE
BACKOFFICE_ALLOW_USER_CREATION = os.environ.get("BACKOFFICE_ALLOW_USER_CREATION", "False") == "True"
BACKOFFICE_USER_EMAIL = secrets_utils.get("BACKOFFICE_USER_EMAIL", "dummy.backoffice@example.com")
BACKOFFICE_SEARCH_SIMILARITY_MINIMAL_SCORE = float(os.environ.get("BACKOFFICE_SEARCH_SIMILARITY_MINIMAL_SCORE", 0.2))
BACKOFFICE_URL = os.environ.get("BACKOFFICE_URL", "")
ENABLE_TEST_USER_GENERATION = bool(int(os.environ.get("ENABLE_TEST_USER_GENERATION", 0)))

# SIRENE
SIRENE_BACKEND = os.environ.get("SIRENE_BACKEND")
INSEE_SIRENE_API_TOKEN = secrets_utils.get("INSEE_SIRENE_API_TOKEN", "")

# ADRESSE
ADRESSE_BACKEND = os.environ.get("ADRESSE_BACKEND")

# GOOGLE BIG QUERY
BIG_QUERY_NOTIFICATIONS_TABLE_BASENAME = os.environ.get("BIG_QUERY_NOTIFICATIONS_TABLE_BASENAME", "")

# METABASE

METABASE_SITE_URL = secrets_utils.get("METABASE_SITE_URL")
METABASE_SECRET_KEY = secrets_utils.get("METABASE_SECRET_KEY")
METABASE_DASHBOARD_ID = int(os.environ.get("METABASE_DASHBOARD_ID", 438))

# AMPLITUDE
AMPLITUDE_API_PUBLIC_KEY = os.environ.get("AMPLITUDE_API_PUBLIC_KEY", "")
AMPLITUDE_BACKEND = os.environ.get("AMPLITUDE_BACKEND", "pcapi.analytics.amplitude.backends.TestingBackend")
AMPLITUDE_QUEUE_NAME = os.environ.get("AMPLITUDE_QUEUE_NAME", "amplitude-queue-development")

# NATIONAL PARTNERS
NATIONAL_PARTNERS_EMAIL_DOMAINS = secrets_utils.get("NATIONAL_PARTNERS_EMAIL_DOMAINS", "impossible_email_domain.fr")

# NAME CHECKING
ENABLE_PERMISSIVE_NAME_VALIDATION = bool(int(os.environ.get("ENABLE_PERMISSIVE_NAME_VALIDATION", 0)))
