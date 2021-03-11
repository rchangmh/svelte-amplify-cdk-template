<script lang='ts'>

  import { Auth } from './store'
  import { Loading, Button, CodeSnippet, TextInput, Modal } from 'carbon-components-svelte'
  import { API, graphqlOperation } from 'aws-amplify'
  import { createToDo } from '../graphql/statements/mutations'

  let name:string = ''
  let user:string = $Auth['attributes']['email']
  let output:string = ''
  let loading: boolean = false

  $: todo = {
    name,
    creator: user,
  }

  async function handleSubmit() {
    try {
      loading = true
      let data = await API.graphql(graphqlOperation(createToDo, {input: todo }))
      loading = false
      output = JSON.stringify(data, null, 2)
      name = ''
    } catch(err) {
      output = JSON.stringify(err, null, 2)
    }
  }

</script>


<h2>Create</h2>
<br />
{#if loading}
  <Loading withOverlay={false} />
{:else}
  <TextInput 
    labelText="To Do"
    placeholder="To Do Name"
    size='xl'
    bind:value={name}
    />
  <br />
  <Button on:click={handleSubmit}>Submit</Button>
  <Modal preventCloseOnClickOutside passiveModal open={output != ''} modalHeading="Response" on:close={() => output = ''} >
    <CodeSnippet wrapText code={output} type="multi" />
  </Modal>
{/if}