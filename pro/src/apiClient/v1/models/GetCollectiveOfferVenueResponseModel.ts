/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GetCollectiveOfferManagingOffererResponseModel } from './GetCollectiveOfferManagingOffererResponseModel';

export type GetCollectiveOfferVenueResponseModel = {
  address?: string | null;
  audioDisabilityCompliant?: boolean | null;
  bookingEmail?: string | null;
  city?: string | null;
  comment?: string | null;
  dateCreated?: string | null;
  dateModifiedAtLastProvider?: string | null;
  departementCode?: string | null;
  fieldsUpdated: Array<string>;
  idAtProviders?: string | null;
  isVirtual: boolean;
  latitude?: number | null;
  longitude?: number | null;
  managingOfferer: GetCollectiveOfferManagingOffererResponseModel;
  managingOffererId: string;
  mentalDisabilityCompliant?: boolean | null;
  motorDisabilityCompliant?: boolean | null;
  name: string;
  nonHumanizedId: number;
  postalCode?: string | null;
  publicName?: string | null;
  siret?: string | null;
  thumbCount: number;
  venueLabelId?: string | null;
  visualDisabilityCompliant?: boolean | null;
};

