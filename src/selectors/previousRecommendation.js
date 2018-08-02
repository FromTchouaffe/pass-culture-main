import get from 'lodash.get'
import createCachedSelector from 're-reselect'

import currentRecommendationSelector from './currentRecommendation'
import recommendationsSelector from './recommendations'

export default createCachedSelector(
  recommendationsSelector,
  currentRecommendationSelector,
  (recommendations, currentRecommendation) => {
    const previousRecommendation =
      currentRecommendation &&
      get(
        recommendations,
        recommendations.findIndex(
          recommendation => recommendation.id === currentRecommendation.id
        ) - 1
      )

    if (!previousRecommendation) {
      return undefined
    }

    // path
    const { mediationId, offerId } = previousRecommendation
    const path = `/decouverte/${offerId}/${mediationId || ''}`

    // return
    return Object.assign(
      {
        path,
      },
      previousRecommendation
    )
  }
)(
  (state, offerId, mediationId, position) =>
    `${offerId || ''}/${mediationId || ''}/${position || ''}`
)
