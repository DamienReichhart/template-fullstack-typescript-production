# Concurrent refreshes are tolerated for ten seconds

Presenting the previous Refresh token within 10 seconds of its Rotation answers `409 SESSION_REFRESH_CONFLICT` and keeps the Session; after that, it is Token reuse and revokes the Session. Several tabs of one browser refresh at the same moment, and treating the slower one as a thief signed people out at random; a thief who replays a stolen token within those 10 seconds gains nothing, because the conflict response carries no new tokens.
