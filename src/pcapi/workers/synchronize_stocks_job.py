import logging

from pcapi.core.offerers.repository import find_venue_by_id
from pcapi.core.providers import api
from pcapi.workers import worker
from pcapi.workers.decorators import job


logger = logging.getLogger(__name__)


@job(worker.low_queue)
def synchronize_stocks_job(stock_details, venue_id: str) -> None:
    venue = find_venue_by_id(venue_id)
    operations = api.synchronize_stocks(stock_details, venue)
    logger.info(
        "Processed stocks synchronization",
        extra={
            "venue": venue_id,
            "stocks": len(stock_details),
            **operations,
        },
    )
