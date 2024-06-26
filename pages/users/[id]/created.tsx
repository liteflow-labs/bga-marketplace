import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import UserProfileTemplate from '../../../components/Profile'
import TokenGrid from '../../../components/Token/Grid'
import { AssetsOrderBy, useFetchCreatedAssetsQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useEnvironment from '../../../hooks/useEnvironment'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../layouts/large'

const CreatedPage: NextPage = () => {
  const { PAGINATION_LIMIT } = useEnvironment()
  const { t } = useTranslation('templates')
  const { pathname, replace, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>('CREATED_AT_DESC')
  const { changeLimit } = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const { data } = useFetchCreatedAssetsQuery({
    variables: {
      address: userAddress,
      currentAddress: address || '',
      limit,
      offset,
      orderBy,
    },
  })

  const assets = useMemo(() => data?.created?.nodes.filter((x) => !!x), [data])

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate address={userAddress} currentTab="created">
        <TokenGrid<AssetsOrderBy>
          assets={assets}
          orderBy={{
            value: orderBy,
            choices: [
              {
                label: t('user.created-assets.orderBy.values.createdAtDesc'),
                value: 'CREATED_AT_DESC',
              },
              {
                label: t('user.created-assets.orderBy.values.createdAtAsc'),
                value: 'CREATED_AT_ASC',
              },
            ],
            onSort: changeOrder,
          }}
          pagination={{
            limit,
            limits: [PAGINATION_LIMIT, 24, 36, 48],
            page,
            onLimitChange: changeLimit,
            hasNextPage: data?.created?.pageInfo.hasNextPage,
            hasPreviousPage: data?.created?.pageInfo.hasPreviousPage,
          }}
        />
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default CreatedPage
