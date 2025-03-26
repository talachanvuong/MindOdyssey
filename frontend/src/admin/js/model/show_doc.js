import callApi from "./callApi.js"

function showDocList(id, array) {
  const list = document.getElementById(id)
  list.innerHTML = ''
  array.forEach((doc) => {
    const li = document.createElement('li')
    li.className =
      'flex flex-row items-center rounded-xl bg-white p-2 shadow-md shadow-gray-300'

    const imgIcon = document.createElement('img')
    imgIcon.src = '../img/docIcon.png'
    imgIcon.className = 'h-10'

    const p = document.createElement('p')
    p.className = 'ml-2 w-full'
    p.textContent = doc.title

    const a = document.createElement('a')
    a.href = `detail.html?id=${doc.document_id}`

    const imgDot = document.createElement('img')
    imgDot.className = 'h-7'
    imgDot.src = '../img/threeDot.png'

    imgDot.addEventListener
    a.appendChild(imgDot)
    li.appendChild(imgIcon)
    li.appendChild(p)
    li.appendChild(a)

    list.appendChild(li)
  })
}

async function showAnswerList(id, array) {
  const list = document.getElementById(id);
  list.innerHTML = ``;
  console.log(array);

  for (const [index, ques] of array.entries()) {
    const li = document.createElement("li");
    li.className =
      "h-fit w-full rounded-xl border border-black bg-white bg-opacity-60 px-2 pb-2 pt-3 overflow-hidden";

    // Question
    const question = document.createElement("p");
    question.className = "border-b-4 border-black pb-1 font-bold";
    question.textContent = `Question ${index + 1}: ` + ques.contents[0].text;

    // Xử lý ảnh/audio câu hỏi (nếu có)
    if (ques.contents[0].attachment) {
      let type = await callApi.checkAttachmentType(ques.contents[0].attachment);
      if (type === "image") {
        const quesImage = document.createElement("img");
        quesImage.src = ques.contents[0].attachment;
        quesImage.className = 'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
        question.appendChild(quesImage);
      } else if (type === "audio") {
        const quesAudio = document.createElement("audio");
        quesAudio.src = ques.contents[0].attachment;
        quesAudio.controls = true;
        question.appendChild(quesAudio);
      }
    }

    const form = document.createElement("form");
    const ul = document.createElement("ul");

    // Duyệt đáp án
    for (const [i, ans] of ques.contents.slice(1).entries()) {
      const a = document.createElement("li");
      a.className = "ml-1 flex flex-col gap-2 my-2";

      const inputAndTextDiv = document.createElement("div");
      inputAndTextDiv.classList = "flex flex-row gap-2";

      const input = document.createElement("input");
      input.type = "radio";
      input.className = "scale-150 cursor-pointer border border-black";
      input.disabled = true;

      // Chọn đáp án đúng
      if ("ABCD"[i] === ques.correct_answer) input.checked = true;

      const ansContent = document.createElement("p");
      ansContent.textContent = ans.text;

      inputAndTextDiv.append(input, ansContent);
      a.appendChild(inputAndTextDiv);
      ul.appendChild(a);

      // Xử lý ảnh/audio của đáp án (nếu có)
      if (ans.attachment) {
        let type = await callApi.checkAttachmentType(ans.attachment);
        if (type === "image") {
          const img = document.createElement("img");
          img.className = 'max-h-96 max-w-fit mx-auto rounded-md shadow-xl border'
          img.src = ans.attachment;
          a.appendChild(img);
        } else if (type === "audio") {
          const audio = document.createElement("audio");
          audio.src = ans.attachment;
          audio.controls = true;
          a.appendChild(audio);
        }
      }
    }

    li.append(question, form);
    form.appendChild(ul);
    list.appendChild(li);

    console.log(`Append question: ${index}`);
  }
}


export default { showDocList, showAnswerList }
