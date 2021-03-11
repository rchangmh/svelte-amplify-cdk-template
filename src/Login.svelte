<script lang='ts'>

  import { Auth as StoreAuth } from './store'
  import Auth from '@aws-amplify/auth'
  import Login16 from "carbon-icons-svelte/lib/Login16"
  import { Row, FluidForm, TextInput, PasswordInput, Button } from 'carbon-components-svelte'
  
  let username = ''
  let password = ''
  let errorStatus = ''
  
  async function signIn() {
    try {
      $StoreAuth = await Auth.signIn({username, password})
      console.log(JSON.stringify($StoreAuth, null, 4))
    } catch(err) {
      console.error(err)
      errorStatus = err.message
    }
  }

  async function signUp() {
    try {
      let signedUp = await Auth.signUp({username, password})
      console.log(signedUp)
    } catch(err) {
      console.error(err)
      errorStatus = err.message
    }
  }
  
</script>

<h2>Sign In</h2>
<br>
<FluidForm on:submit>
  <Row style='margin:1rem 0 1rem 0'>
    <TextInput 
      bind:value={username}
      invalid={errorStatus == 'User does not exist.'}
      invalidText={errorStatus}
      labelText="Email"
      placeholder="Enter email..."
      required
    />
  </Row>
  <Row style='margin: 0.5rem 0 0.5rem 0'>
    <PasswordInput
      bind:value={password}
      invalid={errorStatus == 'Incorrect username or password.'}
      invalidText={errorStatus}
      labelText="Password"
      placeholder="Enter password..."
      required
      type="password"
    />
  </Row>
  <br>
  <Button
    style="margin:auto"
    icon={Login16}
    on:click={signIn}>
    Sign In
  </Button>
  <Button
    style="margin:auto"
    kind="ghost"
    on:click={signUp}>
    Sign Up
  </Button>
</FluidForm>