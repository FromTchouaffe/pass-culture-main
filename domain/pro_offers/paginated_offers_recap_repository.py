from abc import ABC, abstractmethod
from typing import Optional

from domain.identifier.identifier import Identifier

from domain.pro_offers.paginated_offers_recap import PaginatedOffersRecap


class PaginatedOffersRepository(ABC):
    @abstractmethod
    def get_paginated_offers_for_offerer_venue_and_keywords(self,
                                                            user_id: int,
                                                            user_is_admin: bool,
                                                            page: Optional[int],
                                                            pagination_limit: int,
                                                            offerer_id: Optional[Identifier] = None,
                                                            venue_id: Optional[Identifier] = None,
                                                            name_keywords: Optional[str] = None) -> PaginatedOffersRecap:
        pass
