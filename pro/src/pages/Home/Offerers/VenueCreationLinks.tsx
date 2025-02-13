import React from 'react'
import { useLocation } from 'react-router-dom'

import { Events } from 'core/FirebaseEvents/constants'
import useActiveFeature from 'hooks/useActiveFeature'
import useAnalytics from 'hooks/useAnalytics'
import { ButtonLink } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'
import { UNAVAILABLE_ERROR_PAGE } from 'utils/routes'

import { Card } from '../Card'

import styles from './VenueCreationLinks.module.scss'

interface VenueCreationLinksProps {
  hasPhysicalVenue?: boolean
  hasVirtualOffers?: boolean
  offererId?: number
}

const VenueCreationLinks = ({
  hasPhysicalVenue,
  hasVirtualOffers,
  offererId,
}: VenueCreationLinksProps) => {
  const isVenueCreationAvailable = useActiveFeature('API_SIRENE_AVAILABLE')
  const isStatisticsDashboardEnabled = useActiveFeature('WIP_HOME_STATS')
  const { logEvent } = useAnalytics()
  const location = useLocation()

  const venueCreationUrl = isVenueCreationAvailable
    ? `/structures/${offererId}/lieux/creation`
    : UNAVAILABLE_ERROR_PAGE

  const renderLinks = (insideCard: boolean) => {
    return (
      <div className={styles['actions-container']}>
        <ButtonLink
          variant={insideCard ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
          link={{
            to: venueCreationUrl,
            isExternal: false,
          }}
          onClick={() => {
            logEvent?.(Events.CLICKED_CREATE_VENUE, {
              from: location.pathname,
              is_first_venue: !hasPhysicalVenue && !hasVirtualOffers,
            })
          }}
        >
          {!hasPhysicalVenue ? 'Créer un lieu' : 'Ajouter un lieu'}
        </ButtonLink>

        {!isStatisticsDashboardEnabled && (
          <ButtonLink
            variant={ButtonVariant.SECONDARY}
            link={{
              to: `/offre/creation?structure=${offererId}`,
              isExternal: false,
            }}
          >
            Créer une offre
          </ButtonLink>
        )}
      </div>
    )
  }

  const renderCard = () => (
    <Card data-testid="offerers-creation-links-card">
      <h3 className={styles['title']}>Lieux</h3>

      <div className={styles['content']}>
        <p>
          Avant de créer votre première offre physique vous devez avoir un lieu
        </p>
        {renderLinks(true)}
      </div>
    </Card>
  )

  return (
    <div className={styles['container']}>
      {!(hasPhysicalVenue || hasVirtualOffers)
        ? renderCard()
        : renderLinks(false)}
    </div>
  )
}

export default VenueCreationLinks
