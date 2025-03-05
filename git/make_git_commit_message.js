
const debug = {DEBUG}

backing.callback = async (standard_complete, quick_call, kwargs) => {
    let file_path = kwargs.file_path;
    console.log("MAKE_GIT_COMMIT_MESSAGE: ", file_path)

    if (! Bun.file(file_path).exists()) {
        return "file does not exist"
    }
    
    const diff_head = await quick_call(`git diff HEAD -- ${file_path}`)
    
    if (debug) {
        console.log(`# tool_make_git_commit_message(\n\n'${diff_head}'\n\n)`)
    }
    
    if (diff_head === undefined || diff_head === null || diff_head == "") {
        return "diff_head empty"
    }
    
    let text = ""
    let found = false
    for (let line of diff_head.split("\n")) {
        if (debug) {
            console.log(line)
        }
        if (! found && line.includes('@@')) {
            if (debug) {
                console.log('-- found')
            }
            found = true
            continue
        }
        if (found) {
            if (line.trimStart().startsWith('+') || line.trimStart().startsWith('-')) {
                text += `    ${line}\n`
            }
        }
    }

    if (! found || text == "") {
        return "not found or text is blank"
    }

    console.log(`Changes:\n${text}`)
    
    const examples = `
    <examples>
    'added mechanic X, can now A'
    'updated feature Y, now includes B'
    'removed line because Z'
    'added TODO for XYZ'
    </examples>
    `
    
    let response = await standard_complete(`${examples}\n\nsimply describe only the changes you see in the diff, don't speculate:\n\n${text}`, false)
    return response[0].text
}
