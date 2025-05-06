class ScoutSocket {
	public roomName(params: { team: { id: number }; namespace?: string }): string {
		return `teams:${params.team.id}${!!params.namespace ? ':' + params.namespace : ''}`
	}
}

export default new ScoutSocket()
