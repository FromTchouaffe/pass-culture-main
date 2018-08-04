import PropTypes from 'prop-types'
import get from 'lodash.get'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose } from 'redux'

import VersoControl from './VersoControl'
import currentRecommendationSelector from '../selectors/currentRecommendation'
import { ROOT_PATH } from '../utils/config'

import { makeDraggable, makeUndraggable } from '../reducers/verso'

class VersoWrapper extends Component {
  constructor(props) {
    super(props)
    this.toucheMoveHandler = this.toucheMoveHandler.bind(this)
  }

  componentDidMount() {
    if (!this.$el) return
    const opts = { passive: true }
    this.$el.addEventListener('touchmove', this.toucheMoveHandler, opts)
  }

  componentDidUpdate(prevProps) {
    const shouldScroll =
      !this.props.isFlipped && prevProps.isFlipped && this.$header.scrollTo
    if (!shouldScroll) return
    this.$header.scrollTo(0, 0)
  }

  componentWillUnmount() {
    if (!this.$el) return
    this.$el.removeEventListener('touchmove', this.toucheMoveHandler)
  }

  toucheMoveHandler() {
    const {
      draggable,
      dispatchMakeUndraggable,
      dispatchMakeDraggable,
    } = this.props
    if (draggable && this.$el.scrollTop > 0) {
      dispatchMakeUndraggable()
    } else if (!draggable && this.$el.scrollTop <= 0) {
      dispatchMakeDraggable()
    }
  }

  render() {
    const {
      children,
      className,
      currentRecommendation,
      headerColor,
    } = this.props
    const { mediation, offer } = currentRecommendation || {}
    const { eventOrThing, venue } = offer || {}
    const { tutoIndex } = mediation || {}

    const contentStyle = {}
    if (typeof tutoIndex === 'number') {
      contentStyle.backgroundColor = headerColor
    } else {
      contentStyle.backgroundImage = `url('${ROOT_PATH}/mosaic-k@2x.png')`
    }
    const author = get(eventOrThing, 'extraData.author')

    return (
      <div
        ref={$el => {
          this.$el = $el
        }}
        className={`verso-wrapper ${className || ''}`}
      >
        <div
          className="verso-header"
          style={{ backgroundColor: headerColor }}
          ref={$el => {
            this.$header = $el
          }}
        >
          <h1>
            {' '}
            {get(eventOrThing, 'name')}
            {author && `, de ${author}`}
            {' '}
          </h1>
          <h2>
            {get(venue, 'name')}
          </h2>
        </div>
        {typeof tutoIndex !== 'number' && <VersoControl />}
        <div className="verso-content" style={{ ...contentStyle }}>
          {children}
        </div>
      </div>
    )
  }
}

VersoWrapper.defaultProps = {
  currentRecommendation: null,
  headerColor: null,
}

VersoWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
  currentRecommendation: PropTypes.object,
  draggable: PropTypes.bool.isRequired,
  headerColor: PropTypes.string,
  isFlipped: PropTypes.bool.isRequired,
  dispatchMakeDraggable: PropTypes.func.isRequired,
  dispatchMakeUndraggable: PropTypes.func.isRequired,
}

export default compose(
  withRouter,
  connect(
    (state, ownProps) => {
      const { mediationId, offerId } = ownProps.match.params
      return {
        currentRecommendation: currentRecommendationSelector(
          state,
          offerId,
          mediationId
        ),
        isFlipped: state.verso.isFlipped,
        draggable: state.verso.draggable,
      }
    },
    {
      dispatchMakeDraggable: makeDraggable,
      dispatchMakeUndraggable: makeUndraggable,
    }
  )
)(VersoWrapper)
