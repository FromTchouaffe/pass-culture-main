import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

import ActionsBarSticky from 'components/ActionsBarSticky'
import { SearchFiltersParams } from 'core/Offers/types'
import { Audience } from 'core/shared'
import useNotification from 'hooks/useNotification'
import fullHideIcon from 'icons/full-hide.svg'
import fullTrashIcon from 'icons/full-trash.svg'
import fullValidateIcon from 'icons/full-validate.svg'
import { getOffersCountToDisplay } from 'pages/Offers/domain/getOffersCountToDisplay'
import { searchFiltersSelector } from 'store/offers/selectors'
import { Button } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'

import { deleteDraftOffersAdapter } from '../adapters/deleteDraftOffers'

import { updateAllCollectiveOffersActiveStatusAdapter } from './adapters/updateAllCollectiveOffersActiveStatusAdapter'
import { updateAllOffersActiveStatusAdapter } from './adapters/updateAllOffersActiveStatusAdapter'
import { updateCollectiveOffersActiveStatusAdapter } from './adapters/updateCollectiveOffersActiveStatusAdapter'
import { updateOffersActiveStatusAdapter } from './adapters/updateOffersActiveStatusAdapter'
import DeactivationConfirmDialog from './ConfirmDialog/DeactivationConfirmDialog'
import DeleteConfirmDialog from './ConfirmDialog/DeleteConfirmDialog'

export interface ActionBarProps {
  areAllOffersSelected: boolean
  clearSelectedOfferIds: () => void
  nbSelectedOffers: number
  refreshOffers: () => void
  selectedOfferIds: string[]
  toggleSelectAllCheckboxes: () => void
  audience: Audience
  getUpdateOffersStatusMessage: (selectedOfferIds: string[]) => string
  canDeleteOffers: (selectedOfferIds: string[]) => boolean
}

const getUpdateActiveStatusAdapter = (
  areAllOffersSelected: boolean,
  searchFilters: Partial<SearchFiltersParams>,
  isActive: boolean,
  nbSelectedOffers: number,
  selectedOfferIds: string[],
  audience: Audience
) => {
  if (areAllOffersSelected) {
    if (audience === Audience.COLLECTIVE) {
      return () =>
        updateAllCollectiveOffersActiveStatusAdapter({
          searchFilters: { ...searchFilters, isActive },
          nbSelectedOffers,
        })
    }

    return () =>
      updateAllOffersActiveStatusAdapter({
        searchFilters: { ...searchFilters, isActive },
        nbSelectedOffers,
      })
  }

  if (audience === Audience.COLLECTIVE) {
    return () =>
      updateCollectiveOffersActiveStatusAdapter({
        ids: selectedOfferIds,
        isActive,
      })
  }

  return () =>
    updateOffersActiveStatusAdapter({ ids: selectedOfferIds, isActive })
}

const ActionsBar = ({
  refreshOffers,
  selectedOfferIds,
  clearSelectedOfferIds,
  toggleSelectAllCheckboxes,
  areAllOffersSelected,
  nbSelectedOffers,
  audience,
  getUpdateOffersStatusMessage,
  canDeleteOffers,
}: ActionBarProps): JSX.Element => {
  const searchFilters = useSelector(searchFiltersSelector)
  const notify = useNotification()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleClose = useCallback(() => {
    clearSelectedOfferIds()
    areAllOffersSelected && toggleSelectAllCheckboxes()
  }, [clearSelectedOfferIds, areAllOffersSelected, toggleSelectAllCheckboxes])

  const handleUpdateOffersStatus = async (isActivating: boolean) => {
    const adapter = getUpdateActiveStatusAdapter(
      areAllOffersSelected,
      searchFilters,
      isActivating,
      nbSelectedOffers,
      selectedOfferIds,
      audience
    )

    const { isOk, message } = await adapter()
    refreshOffers()

    if (!isOk) {
      notify.error(message)
    }

    areAllOffersSelected ? notify.pending(message) : notify.success(message)
    handleClose()
  }

  const handleActivate = async () => {
    const updateOfferStatusMessage =
      getUpdateOffersStatusMessage(selectedOfferIds)
    if (!updateOfferStatusMessage) {
      await handleUpdateOffersStatus(true)
    } else {
      notify.error(updateOfferStatusMessage)
    }
  }

  const handleDeactivate = async () => {
    await handleUpdateOffersStatus(false)
    setIsConfirmDialogOpen(false)
  }

  const computeSelectedOffersLabel = () => {
    if (nbSelectedOffers > 1) {
      return `${getOffersCountToDisplay(nbSelectedOffers)} offres sélectionnées`
    }

    return `${nbSelectedOffers} offre sélectionnée`
  }

  const handleDelete = useCallback(async () => {
    if (!canDeleteOffers(selectedOfferIds)) {
      notify.error('Seuls les  brouillons peuvent être supprimés')
      return
    }
    const { isOk, message } = await deleteDraftOffersAdapter({
      ids: selectedOfferIds,
      nbSelectedOffers,
    })
    if (!isOk) {
      notify.error(message)
    } else {
      notify.success(message)
      refreshOffers()
      clearSelectedOfferIds()
    }
    setIsDeleteDialogOpen(false)
  }, [selectedOfferIds, nbSelectedOffers])

  const handleOpenDeleteDialog = () => {
    if (!canDeleteOffers(selectedOfferIds)) {
      notify.error('Seuls les brouillons peuvent être supprimés')
      return
    }
    setIsDeleteDialogOpen(true)
  }

  const Left = () => <span role="status">{computeSelectedOffersLabel()}</span>

  const Right = () => (
    <>
      <Button onClick={handleClose} variant={ButtonVariant.SECONDARY}>
        Annuler
      </Button>
      <Button
        onClick={() => setIsConfirmDialogOpen(true)}
        icon={fullHideIcon}
        variant={ButtonVariant.SECONDARY}
      >
        Désactiver
      </Button>
      {audience == Audience.INDIVIDUAL && (
        <Button
          onClick={() => handleOpenDeleteDialog()}
          icon={fullTrashIcon}
          variant={ButtonVariant.SECONDARY}
        >
          Supprimer
        </Button>
      )}
      <Button
        onClick={handleActivate}
        icon={fullValidateIcon}
        variant={ButtonVariant.SECONDARY}
      >
        Publier
      </Button>
    </>
  )

  return (
    <>
      {isConfirmDialogOpen && (
        <DeactivationConfirmDialog
          areAllOffersSelected={areAllOffersSelected}
          nbSelectedOffers={nbSelectedOffers}
          onConfirm={handleDeactivate}
          onCancel={() => setIsConfirmDialogOpen(false)}
          audience={audience}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteConfirmDialog
          onCancel={() => setIsDeleteDialogOpen(false)}
          nbSelectedOffers={nbSelectedOffers}
          handleDelete={handleDelete}
        />
      )}

      <ActionsBarSticky>
        <ActionsBarSticky.Left>
          <Left />
        </ActionsBarSticky.Left>
        <ActionsBarSticky.Right>
          <Right />
        </ActionsBarSticky.Right>
      </ActionsBarSticky>
    </>
  )
}

export default ActionsBar
