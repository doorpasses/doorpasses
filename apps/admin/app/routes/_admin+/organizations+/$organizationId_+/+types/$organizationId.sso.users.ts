import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router'

export interface Route {
	LoaderArgs: LoaderFunctionArgs
	ActionArgs: ActionFunctionArgs
}
