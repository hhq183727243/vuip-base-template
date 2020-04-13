
export function getAuthority() {
	const authorityString = localStorage.getItem('AuthorizationUser');
	let authority;

	try {
		authority = JSON.parse(authorityString);
	} catch (e) {
		authority = authorityString;
	}

	return authority;
}

export function isOverdue() {
	let nowTime = new Date().getTime();
	let overdueTime = localStorage.getItem('AuthorizationTime');//设置过期时间

	if (!!overdueTime) {
		overdueTime = parseInt(overdueTime, 10);

		if (nowTime > overdueTime) {
			clearAuthority();

			return true;
		} else {
			return false;
		}
	} else {
		clearAuthority();
		return true;
	}
}

export function setAuthority(authority, user) {
	// const remember = localStorage.getItem('remember') === 'true';

	localStorage.setItem('Authorization', authority);
	// localStorage.setItem('AuthorizationTime', (new Date().getTime() + (remember ? (24 * 30) : 6) * 3600 * 1000));//设置过期时间
	if(user){
		localStorage.setItem('AuthorizationUser', JSON.stringify(user));
	}
}


export function clearAuthority() {
	localStorage.removeItem('Authorization');
	localStorage.removeItem('AuthorizationUser');
	localStorage.removeItem('AuthorizationTime');
	sessionStorage.clear();
}

