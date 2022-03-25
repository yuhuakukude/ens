import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { Trans } from 'react-i18next'

import { H2 } from '../components/Typography/Basic'
import DomainInfo from '../components/SearchName/DomainInfo'
import { validateName, parseSearchTerm } from '../utils/utils'
import SearchErrors from '../components/SearchErrors/SearchErrors'
import { useHistory } from 'react-router-dom'
import styled from '@emotion/styled/macro'

const H22 = styled(H2)`
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  color: #47c799;
`

const RESULTS_CONTAINER = gql`
  query getResultsContainer {
    isENSReady @client
  }
`

import {
  NonMainPageBannerContainer,
  DAOBannerContent
} from '../components/Banner/DAOBanner'

const useCheckValidity = (_searchTerm, isENSReady) => {
  const [errors, setErrors] = useState([])
  const [parsed, setParsed] = useState(null)

  useEffect(() => {
    const checkValidity = async () => {
      let _parsed, searchTerm
      setErrors([])

      if (_searchTerm.split('.').length === 1) {
        searchTerm = _searchTerm + '.bnb'
      } else {
        searchTerm = _searchTerm
      }

      const type = await parseSearchTerm(searchTerm)
      if (!['unsupported', 'invalid', 'short'].includes(type)) {
        _parsed = validateName(searchTerm)
        setParsed(_parsed)
      }
      document.title = `ENS Search: ${searchTerm}`

      if (type === 'unsupported') {
        setErrors(['unsupported'])
      } else if (type === 'short') {
        setErrors(['tooShort'])
      } else if (type === 'invalid') {
        setErrors(['domainMalformed'])
      }
    }
    if (isENSReady) {
      checkValidity()
    }
  }, [_searchTerm, isENSReady])

  return { errors, parsed }
}

const ResultsContainer = ({ searchDomain, match }) => {
  const {
    data: { isENSReady }
  } = useQuery(RESULTS_CONTAINER)
  const searchTerm = match.params.searchTerm
  const history = useHistory()
  const lowered = searchTerm.toLowerCase()
  if (history && lowered !== searchTerm) {
    history.push(`/search/${lowered}`)
  }

  const { errors, parsed } = useCheckValidity(searchTerm, isENSReady)

  if (!isENSReady) {
    return <div>Loading</div>
  }

  if (errors[0] === 'tooShort') {
    return (
      <>
        <SearchErrors errors={errors} searchTerm={searchTerm} />
      </>
    )
  } else if (errors.length > 0) {
    return <SearchErrors errors={errors} searchTerm={searchTerm} />
  }
  if (parsed) {
    return (
      <>
        <H22>
          <Trans i18nKey="singleName.search.title">Names</Trans>
        </H22>
        <DomainInfo searchTerm={parsed} />
      </>
    )
  } else {
    return ''
  }
}

export default ResultsContainer
