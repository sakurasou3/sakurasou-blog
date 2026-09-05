import { Client } from '@notionhq/client'

/**
 * Notion 連携に必要な環境変数を取得する。
 *
 * @returns 設定済みの環境変数値
 * @throws 環境変数が未設定の場合
 */
function getRequiredEnvironmentVariable(
  name: 'NOTION_API_KEY' | 'NOTION_DATABASE_ID'
) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required to access the Notion database.`)
  }

  return value
}

export const notionClient = new Client({
  auth: getRequiredEnvironmentVariable('NOTION_API_KEY'),
})

export const notionDatabaseId =
  getRequiredEnvironmentVariable('NOTION_DATABASE_ID')
