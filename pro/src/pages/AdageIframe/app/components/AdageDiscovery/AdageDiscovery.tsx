import React, { useEffect, useRef, useState } from 'react'

import { AdagePlaylistType } from 'apiClient/adage'
import { api, apiAdage } from 'apiClient/api'
import { GET_DATA_ERROR_MESSAGE } from 'core/shared/constants'
import useIsElementVisible from 'hooks/useIsElementVisible'
import useNotification from 'hooks/useNotification'
import fullLinkIcon from 'icons/full-link.svg'
import { Option } from 'pages/AdageIframe/app/types'
import { ButtonLink } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'

import styles from './AdageDiscovery.module.scss'
import Carousel from './Carousel/Carousel'
import { DOMAINS_PLAYLIST } from './constant'
import circles from './DomainsCard/assets/circles.svg'
import ellipses from './DomainsCard/assets/ellipses.svg'
import pills from './DomainsCard/assets/pills.svg'
import rectangles from './DomainsCard/assets/rectangles.svg'
import squares from './DomainsCard/assets/squares.svg'
import triangles from './DomainsCard/assets/triangles.svg'
import DomainsCard from './DomainsCard/DomainsCard'
import { ClassroomPlaylist } from './Playlist/ClassroomPlaylist'
import { NewOfferPlaylist } from './Playlist/NewOfferPlaylist'
import { VenuePlaylist } from './Playlist/VenuePlaylist'

export type TrackerElementArg = {
  playlistId: number
  playlistType: AdagePlaylistType
  elementId?: number
}

export const AdageDiscovery = () => {
  const hasSeenAllPlaylist = useRef<boolean>(false)
  const params = new URLSearchParams(location.search)
  const [domainsOptions, setDomainsOptions] = useState<Option<number>[]>([])

  const footerSuggestion = useRef<HTMLDivElement | null>(null)
  const isFooterSuggestionVisible = useIsElementVisible(footerSuggestion)

  const notification = useNotification()
  const adageAuthToken = params.get('token')

  if (isFooterSuggestionVisible && !hasSeenAllPlaylist.current) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    apiAdage.logHasSeenAllPlaylist({ iframeFrom: location.pathname })
    hasSeenAllPlaylist.current = true
  }

  useEffect(() => {
    const getAllDomains = async () => {
      try {
        const result = await api.listEducationalDomains()

        return setDomainsOptions(
          result.map(({ id, name }) => ({ value: id, label: name }))
        )
      } catch {
        notification.error(GET_DATA_ERROR_MESSAGE)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getAllDomains()
  }, [notification])

  function onWholePlaylistSeen({
    playlistId,
    playlistType,
  }: TrackerElementArg) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    apiAdage.logHasSeenWholePlaylist({
      iframeFrom: location.pathname,
      playlistId,
      playlistType,
    })
  }

  const colorAndMotifOrder = [
    { color: 'orange', src: squares },
    { color: 'purple', src: pills },
    { color: 'pink', src: triangles },
    { color: 'green', src: rectangles },
    { color: 'red', src: ellipses },
    { color: 'blue', src: circles },
  ]

  const trackPlaylistElementClicked = ({
    playlistId,
    playlistType,
    elementId,
  }: {
    playlistId: number
    playlistType: AdagePlaylistType
    elementId?: number
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    apiAdage.logConsultPlaylistElement({
      iframeFrom: location.pathname,
      playlistId,
      playlistType,
      elementId,
    })
  }

  return (
    <div className={styles['discovery']}>
      <div className={styles['discovery-banner']}>
        <h1 className={styles['discovery-banner-title']}>
          Découvrez <span>la part collective</span> du pass Culture
        </h1>
      </div>

      <div className={styles['discovery-playlists']}>
        <div className={styles['discovery-playlist']}>
          <NewOfferPlaylist
            onWholePlaylistSeen={onWholePlaylistSeen}
            trackPlaylistElementClicked={trackPlaylistElementClicked}
          />
        </div>
        <div className={styles['discovery-playlist']}>
          <Carousel
            title={
              <h2 className={styles['section-title']}>
                Explorez les domaines artistiques et culturels
              </h2>
            }
            onLastCarouselElementVisible={() =>
              onWholePlaylistSeen({
                playlistId: DOMAINS_PLAYLIST,
                playlistType: AdagePlaylistType.DOMAIN,
              })
            }
            elements={domainsOptions.map((elm, key) => {
              const colorAndMotif =
                colorAndMotifOrder[key % colorAndMotifOrder.length]

              return (
                <DomainsCard
                  handlePlaylistElementTracking={() =>
                    trackPlaylistElementClicked({
                      playlistId: DOMAINS_PLAYLIST,
                      playlistType: AdagePlaylistType.DOMAIN,
                      elementId: key,
                    })
                  }
                  key={`domains-${elm.value}`}
                  title={elm.label}
                  color={colorAndMotif.color}
                  src={colorAndMotif.src}
                  href={`/adage-iframe/recherche?token=${adageAuthToken}&domain=${elm.value}`}
                />
              )
            })}
          ></Carousel>
        </div>
        <div className={styles['discovery-playlist']}>
          <ClassroomPlaylist
            onWholePlaylistSeen={onWholePlaylistSeen}
            trackPlaylistElementClicked={trackPlaylistElementClicked}
          />
        </div>

        <div className={styles['discovery-playlist']}>
          <VenuePlaylist
            onWholePlaylistSeen={onWholePlaylistSeen}
            trackPlaylistElementClicked={trackPlaylistElementClicked}
          />
        </div>
      </div>
      <div className={styles['discovery-suggestion']}>
        <h2 className={styles['section-title']}>
          Une idée de rubrique ? Soumettez-la nous !
        </h2>
        <ButtonLink
          className={styles['discovery-suggestion-link']}
          variant={ButtonVariant.TERNARYPINK}
          link={{
            to: 'https://passculture.qualtrics.com/jfe/form/SV_6GsfVHSIYQZqdM2',
            isExternal: true,
          }}
          icon={fullLinkIcon}
        >
          Proposer une idée
        </ButtonLink>
      </div>
    </div>
  )
}
