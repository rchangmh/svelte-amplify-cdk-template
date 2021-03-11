<script lang="ts">
  import { onMount } from "svelte"
  import { API, graphqlOperation } from "aws-amplify"
  import { listToDos } from "../graphql/statements/queries"
  import { deleteToDo } from "../graphql/statements/mutations"
  import {
    DataTable,
    Button,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    ToolbarBatchActions,
  } from "carbon-components-svelte"
  import Renew32 from "carbon-icons-svelte/lib/Renew32"
  import TrashCan32 from "carbon-icons-svelte/lib/TrashCan32"

  // Headers
  let headers = [
    { key: "name", value: "Name" },
    { key: "creator", value: "Creator" },
    { key: "createdAt", value: "Created" },
  ]

  // Rows
  let rows = []
  let searchString = ""
  $: displayedRows = rows.filter(
    (row) => `${row["name"]}${row["creator"]}`.search(searchString) > -1
  )

  // List
  async function handleList() {
    try {
      let response = await API.graphql(graphqlOperation(listToDos, {}))
      rows = response["data"]["listToDos"]["items"]
    } catch (err) {
      console.error(err)
    }
  }
  onMount(handleList)

  // Delete
  let selectedRowIds = []
  function handleDelete() {
    try {
      selectedRowIds.map(async (id) => {
        await API.graphql(graphqlOperation(deleteToDo, { input: { id } }))
        handleList()
      })
      selectedRowIds = []
    } catch (err) {
      console.error(err)
    }
  }
</script>

<h2>Read</h2>
<br />
<DataTable sortable radio bind:selectedRowIds {headers} rows={displayedRows}>
  <Toolbar>
    <ToolbarBatchActions>
      <Button icon={TrashCan32} on:click={handleDelete}>Delete</Button>
    </ToolbarBatchActions>
    <ToolbarContent>
      <ToolbarSearch persistent bind:value={searchString} />
      <Button icon={Renew32} on:click={handleList} />
    </ToolbarContent>
  </Toolbar>
</DataTable>
