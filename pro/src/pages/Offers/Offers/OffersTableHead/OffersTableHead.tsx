import cn from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'

import { OfferStatus } from 'apiClient/v1'
import { CollectiveOfferStatus } from 'core/OfferEducational'
import { ADMINS_DISABLED_FILTERS_MESSAGE } from 'core/Offers/constants'
import { SearchFiltersParams } from 'core/Offers/types'
import { Audience } from 'core/shared'
import { searchFiltersSelector } from 'store/offers/selectors'
import { BaseCheckbox } from 'ui-kit/form/shared'
import { mapBrowserStatusToApi } from 'utils/translate'

import StatusFiltersButton from './StatusFiltersButton'

type OffersTableHeadProps = {
  applyFilters: () => void
  areAllOffersSelected: boolean
  areOffersPresent: boolean
  filters: SearchFiltersParams
  isAdminForbidden: (searchFilters: SearchFiltersParams) => boolean
  selectAllOffers: () => void
  updateStatusFilter: (
    status: OfferStatus | CollectiveOfferStatus | 'all'
  ) => void
  audience: Audience
  isAtLeastOneOfferChecked: boolean
}

const OffersTableHead = ({
  areAllOffersSelected,
  areOffersPresent,
  filters,
  isAdminForbidden,
  applyFilters,
  selectAllOffers,
  updateStatusFilter,
  audience,
  isAtLeastOneOfferChecked,
}: OffersTableHeadProps): JSX.Element => {
  const savedSearchFilters = useSelector(searchFiltersSelector)

  return (
    <thead>
      <tr>
        <th className="th-checkbox">
          <BaseCheckbox
            checked={areAllOffersSelected || isAtLeastOneOfferChecked}
            className={cn('select-offer-checkbox', {
              ['partial-check']:
                !areAllOffersSelected && isAtLeastOneOfferChecked,
            })}
            disabled={isAdminForbidden(savedSearchFilters) || !areOffersPresent}
            id="select-offer-checkbox"
            onChange={selectAllOffers}
            label=""
          />
        </th>
        <th
          className={`th-checkbox-label ${
            isAdminForbidden(savedSearchFilters) || !areOffersPresent
              ? 'label-disabled'
              : ''
          }`}
        >
          <label
            htmlFor="select-offer-checkbox"
            title={
              isAdminForbidden(savedSearchFilters)
                ? ADMINS_DISABLED_FILTERS_MESSAGE
                : undefined
            }
          >
            {areAllOffersSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </label>
        </th>
        <th />
        <th>Lieu</th>
        <th>{audience === Audience.COLLECTIVE ? 'Établissement' : 'Stocks'}</th>
        <th className="th-with-filter">
          <StatusFiltersButton
            applyFilters={applyFilters}
            disabled={isAdminForbidden(filters)}
            status={mapBrowserStatusToApi[filters.status] ?? 'all'}
            updateStatusFilter={updateStatusFilter}
            audience={audience}
          />
        </th>
        <th className="th-actions">Actions</th>
      </tr>
    </thead>
  )
}

export default OffersTableHead
