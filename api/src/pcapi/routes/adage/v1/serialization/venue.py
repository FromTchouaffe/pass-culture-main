from typing import Any
from typing import Optional

from pcapi.core.offerers.models import Venue
from pcapi.core.offerers.models import VenueContact
from pcapi.routes.serialization import BaseModel


class BaseVenueModel(BaseModel):
    name: str
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    city: Optional[str]
    publicName: Optional[str]
    description: Optional[str]
    id: int
    adageId: Optional[str]
    email: Optional[str]
    website: Optional[str]
    phoneNumber: Optional[str]

    @classmethod
    def from_orm(cls: Any, venue: Venue):  # type: ignore
        contact: VenueContact = venue.contact
        venue.email = contact.email
        venue.website = contact.website
        venue.phoneNumber = contact.phone_number

        return super().from_orm(venue)

    class Config:
        orm_mode = True


class VenueModelWithOptionalSiret(BaseVenueModel):
    siret: Optional[str]


class VenueModelWithRequiredSiret(BaseVenueModel):
    siret: str


class GetVenuesBySiretResponseModel(BaseModel):
    venues: list[VenueModelWithRequiredSiret]


class GetVenuesByNameResponseModel(BaseModel):
    venues: list[VenueModelWithOptionalSiret]
