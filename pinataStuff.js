//const file = new File(["ever since i was a jit kdfl;sfdafkfsfhfghfgfh"], "testing.txt", { type: "text/plain" });
async function uploadUserFile(file, userName, category) {
  try {
    const groups = await pinata.groups.list()
    const group = pinata.groups.list()[1].id
    const dateStrings  = new Date().toLocaleString().split(',')
    const date = dateStrings[0]
    const time = dateStrings[1]
    const upload = await pinata.upload.file(file).group(group).addMetadata({
      keyvalues: {
        "username": userName,
        "category": category,
        "date": date,
      },
    })
    console.log(upload);
    return upload;
  } catch (error) {
    console.log(error);
  }
}

async function fetchFileByUserNameAndCategory(userName, category) {
    try {
      // List files with the specified name filter
      const response = await pinata.files.list().metadata({
        keyvalues: {
          "username": userName,
          "category": category
        },
      });

      // Check if any files are returned
      if (response.files && response.files.length > 0) {
        console.log("Files found:", response.files);
       
        return response.files;
      } else {
        console.log("No file found with the name:", fileName);
        return null;
      }
    } catch (error) {
      console.error("Error fetching file by name:", error.message);
      // Handle error or retry logic as needed
    }
  }