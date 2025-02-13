import React, { useEffect, useRef, useState } from 'react'

import { api } from 'apiClient/api'
import {
  GetOffererResponseModel,
  GetOfferersNamesResponseModel,
} from 'apiClient/v1'
import { AppLayout } from 'app/AppLayout'
import AddBankAccountCallout from 'components/Callout/AddBankAccountCallout'
import LinkVenueCallout from 'components/Callout/LinkVenueCallout'
import PendingBankAccountCallout from 'components/Callout/PendingBankAccountCallout'
import { Newsletter } from 'components/Newsletter'
import TutorialDialog from 'components/TutorialDialog'
import { hasStatusCode } from 'core/OfferEducational'
import useActiveFeature from 'hooks/useActiveFeature'
import useRemoteConfig from 'hooks/useRemoteConfig'
import { INITIAL_OFFERER_VENUES } from 'pages/Home/OffererVenues'
import { HTTP_STATUS } from 'repository/pcapi/pcapiClient'

import styles from './Homepage.module.scss'
import { OffererBanners } from './Offerers/OffererBanners'
import Offerers from './Offerers/Offerers'
import { ProfileAndSupport } from './ProfileAndSupport/ProfileAndSupport'
import { StatisticsDashboard } from './StatisticsDashboard/StatisticsDashboard'
import { VenueOfferSteps } from './VenueOfferSteps'

export const Homepage = (): JSX.Element => {
  const profileRef = useRef<HTMLElement>(null)
  const offerersRef = useRef<HTMLElement>(null)

  const [receivedOffererNames, setReceivedOffererNames] =
    useState<GetOfferersNamesResponseModel | null>(null)
  const [selectedOffererId, setSelectedOffererId] = useState<string>('')
  const [selectedOfferer, setSelectedOfferer] =
    useState<GetOffererResponseModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasNoVenueVisible, setHasNoVenueVisible] = useState(false)
  const [isUserOffererValidated, setIsUserOffererValidated] = useState(false)
  const [venues, setVenues] = useState(INITIAL_OFFERER_VENUES)
  const { remoteConfigData } = useRemoteConfig()
  const isStatisticsDashboardEnabled = useActiveFeature('WIP_HOME_STATS')

  useEffect(() => {
    async function loadOfferer(offererId: string) {
      try {
        const receivedOfferer = await api.getOfferer(Number(offererId))
        const offererPhysicalVenues =
          receivedOfferer.managedVenues?.filter((venue) => !venue.isVirtual) ??
          []
        const virtualVenue =
          receivedOfferer.managedVenues?.find((venue) => venue.isVirtual) ??
          null
        setHasNoVenueVisible(
          offererPhysicalVenues?.length === 0 && !virtualVenue?.hasCreatedOffer
        )
        setVenues({
          physicalVenues: offererPhysicalVenues,
          virtualVenue: virtualVenue,
        })
        setSelectedOfferer(receivedOfferer)
        setIsUserOffererValidated(true)
      } catch (error) {
        /* istanbul ignore next: DEBT, TO FIX */
        if (hasStatusCode(error) && error.status === HTTP_STATUS.FORBIDDEN) {
          setSelectedOfferer({
            apiKey: {
              maxAllowed: 0,
              prefixes: [],
            },
            city: '',
            dateCreated: '',
            hasAvailablePricingPoints: false,
            hasDigitalVenueAtLeastOneOffer: false,
            hasValidBankAccount: true,
            hasPendingBankAccount: false,
            hasNonFreeOffer: true,
            venuesWithNonFreeOffersWithoutBankAccounts: [],
            isActive: false,
            isValidated: false,
            managedVenues: [],
            name: '',
            id: Number(offererId) ?? 0,
            postalCode: '',
          })
          setVenues(INITIAL_OFFERER_VENUES)
          setIsUserOffererValidated(false)
        }
      }
      setIsLoading(false)
    }

    if (selectedOffererId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadOfferer(selectedOffererId)
    }
  }, [selectedOffererId])

  useEffect(() => {
    const loadOffererNames = async () => {
      const offererNames = await api.listOfferersNames()
      setReceivedOffererNames(offererNames)
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadOffererNames()
  }, [])

  useEffect(() => {
    async function logProFlags() {
      if (remoteConfigData !== null) {
        await api.postProFlags({
          firebase: remoteConfigData,
        })
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    logProFlags()
  }, [remoteConfigData?.REMOTE_CONFIG_LOADED])

  const hasAtLeastOnePhysicalVenue =
    selectedOfferer?.managedVenues?.some(
      (venue) => !venue.isVirtual && venue.id
    ) ?? false

  return (
    <AppLayout>
      <h1>Bienvenue dans l’espace acteurs culturels</h1>

      <div className={styles['reimbursements-banners']}>
        <AddBankAccountCallout offerer={selectedOfferer} />
        <LinkVenueCallout offerer={selectedOfferer} />
        <PendingBankAccountCallout offerer={selectedOfferer} />
      </div>

      {isStatisticsDashboardEnabled && selectedOfferer !== null && (
        <>
          <OffererBanners
            isUserOffererValidated={isUserOffererValidated}
            selectedOfferer={selectedOfferer}
            hasAtLeastOnePhysicalVenue={hasAtLeastOnePhysicalVenue}
          />

          <section className={styles['section']}>
            <StatisticsDashboard offerer={selectedOfferer} />
          </section>
        </>
      )}

      <section className={styles['section']} ref={offerersRef}>
        <Offerers
          selectedOfferer={selectedOfferer}
          isLoading={isLoading}
          isUserOffererValidated={isUserOffererValidated}
          hasAtLeastOnePhysicalVenue={hasAtLeastOnePhysicalVenue}
          receivedOffererNames={receivedOffererNames}
          onSelectedOffererChange={setSelectedOffererId}
          cancelLoading={() => setIsLoading(false)}
          venues={venues}
        />
      </section>

      {isUserOffererValidated && hasNoVenueVisible && (
        <section className={styles['step-section']}>
          <VenueOfferSteps
            hasVenue={!hasNoVenueVisible}
            offererId={Number(selectedOffererId)}
            offererHasBankAccount={Boolean(
              selectedOfferer?.hasPendingBankAccount ||
                selectedOfferer?.hasValidBankAccount
            )}
          />
        </section>
      )}

      <section className={styles['section']} ref={profileRef}>
        <ProfileAndSupport />

        <div className={styles['newsletter']}>
          <Newsletter />
        </div>
      </section>

      <TutorialDialog />
    </AppLayout>
  )
}

// Lazy-loaded by react-router-dom
// ts-unused-exports:disable-next-line
export const Component = Homepage
