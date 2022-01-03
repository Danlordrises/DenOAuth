import { GitHubClient } from './GitHub_client.ts';

export abstract class GitHubGrant {
	constructor(
	protected readonly client: GitHubClient
) {}
}

export class GitHubStrategy extends GitHubGrant {
  constructor(
    client: GitHubClient
  ) {
    super(client);
  }

  // const SampleLink: String = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri={your_callback_url}&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`

  // part 1
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink() {
    const state:number = Math.floor(Math.random() * 1000000000);
    const encode:string = encodeURIComponent(this.client.config.redirect);
    const SampleLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.client.config.clientId}&redirect_uri=${encode}&state=${state}&scope=${this.client.config.scope}`;
    return SampleLink;
  }


   // part 2
  async processAuth(stringPathName:string) {
   /**
   * Parses the authorization response request tokens from the authorization server.
   */
    const code:string = JSON.stringify(stringPathName.search);
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
    const userResponse:any = [];
    
   /** Exchange the authorization code for an access token */
   await fetch('https://www.linkedin.com/oauth/v2/accessToken',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams({
      'grant_type': "authorization_code", // hard code
      'code': parsedCode, // helper function
      'redirect_uri': this.client.config.redirect, // linkedin uri
      'client_id': this.client.config.clientId, // provided by linkedin
      'client_secret': this.client.config.clientSecret //provided by linkedin
      })
    })
    .then((response: any) => {
      return response.text()
     })
    .then( async (paramsString: any) => {
      const params = new URLSearchParams(paramsString);
        const tokenKey = [];
        for (const [key, value] of params.entries()){
        tokenKey.push(key, value)
        }

        const obj:any = tokenKey[0];
        const values = Object.values(obj);
        const tokenArr = []
        let i = 17;
        while (values[i] !== '"') {
          tokenArr.push(values[i])
          i++
          }
          const bearerToken = await tokenArr.join('');

          /** Use the access token to make an authenticated API request */
          await fetch("https://api.linkedin.com/v2/me", {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                },
              })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                userResponse.push(data)
              })
              .catch(console.error)
        }) 
        return userResponse[0];
    } 
  }