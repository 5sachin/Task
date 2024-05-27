import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  query,
  deleteDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFsIvrAdB6sOnVMXVWTwX-3IwLRP16eKk",
  authDomain: "mytask-1d80c.firebaseapp.com",
  projectId: "mytask-1d80c",
  storageBucket: "mytask-1d80c.appspot.com",
  messagingSenderId: "200847685523",
  appId: "1:200847685523:web:7069beb004156174c0da66",
  measurementId: "G-RM10F4YE2Q",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const data = [];

export function register() {
  let email = document.getElementById("registeremail").value;
  let password = document.getElementById("registerpassword").value;
  let registererror = document.getElementById("registererror");

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      registererror.innerHTML = "Account Created";
      registererror.classList.remove("alert-danger");
      registererror.classList.add("alert-success");
    })
    .catch((error) => {
      console.log(error);
      registererror.innerHTML = error;
      registererror.classList.remove("d-none");
      registererror.classList.add("alert-danger");
    });
}

export function login() {
  let email = document.getElementById("loginemail").value;
  let password = document.getElementById("loginpassword").value;
  let registererror = document.getElementById("loginerror");

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.localStorage.setItem("uid", userCredential.user.uid);
      location.href = "dashboard.html";
    })
    .catch((error) => {
      registererror.innerHTML = error.message;
      registererror.classList.remove("d-none");
      registererror.classList.add("alert-danger");
    });
}

const db = getFirestore(app);

export function saveFormData() {
  let name = document.getElementById("formname").value;
  let email = document.getElementById("formemail").value;
  let age = document.getElementById("formage").value;
  let city = document.getElementById("formcity");
  let cityvalue = city.options[city.selectedIndex].text;
  let gender = document.querySelector(
    "input[type='radio'][name=formgender]:checked"
  ).value;

  let formerror = document.getElementById("formerror");
  addDoc(collection(db, `users/forms`, window.localStorage.getItem("uid")), {
    name: name,
    email: email,
    age: age,
    city: cityvalue,
    gender: gender,
  })
    .then((addeddata) => {
      formerror.innerHTML = "Added";
      formerror.classList.remove("d-none");
      formerror.classList.add("alert-success");
      data.push({
        name: name,
        email: email,
        age: age,
        city: cityvalue,
        gender: gender,
        id: addeddata.id,
      });
      generateTableRows(data);
    })
    .catch((error) => {
      console.log(error);
      formerror.innerHTML = error.message;
      formerror.classList.remove("d-none alert-success");
      formerror.classList.add("alert-danger");
    });
}

export function loadFormData() {
  const nestedDocRef = query(
    collection(db, `users/forms/`, window.localStorage.getItem("uid"))
  );

  getDocs(nestedDocRef)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        docData.id = doc.id;
        data.push(docData);
      });
      generateTableRows(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function generateTableRows(users) {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.city}</td>
          <td>${user.age}</td>
          <td>${user.gender}</td>
          <td><button class="btn btn-primary" onclick="openEditModal(${index})">Edit</button></td>
          <td><button class="btn btn-danger" onclick="deleteRow(${index})">Delete</button></td>
      `;

    tbody.appendChild(row);
  });
}

function setDropdownValue(value) {
  const dropdown = document.getElementById("editCity");
  console.log(dropdown);
  for (let i = 0; i < dropdown.options.length; i++) {
    console.log(dropdown.options[i].value, " ", value);
    if (dropdown.options[i].value === value) {
      dropdown.selectedIndex = i;
      break;
    }
  }
}

function setRadioValue(value) {
  const radio = document.querySelector(`input.radio-option[value="${value}"]`);
  if (radio) {
    radio.checked = true;
  } else {
    console.error("Radio button with value", value, "not found.");
  }
}
export function openEditModal(index) {
  const user = data[index];
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  setDropdownValue(user.city);
  document.getElementById("editAge").value = user.age;
  setRadioValue(user.gender);

  $("#editModal").modal("show");

  document.getElementById("editForm").onsubmit = (event) => {
    event.preventDefault();
    editSaveChanges(user.id, index);
  };
}

function editSaveChanges(userId, index) {
  const userDocRef = doc(
    db,
    `users/forms/`,
    window.localStorage.getItem("uid"),
    userId
  );

  let city = document.getElementById("editCity");
  let cityvalue = city.options[city.selectedIndex].text;

  const updatedUser = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    city: cityvalue,
    age: document.getElementById("editAge").value,
    gender: document.querySelector(
      "input[type='radio'][name=editGender]:checked"
    ).value,
  };

  updateDoc(userDocRef, updatedUser)
    .then((updatedData) => {
      data[index] = { id: userId, ...updatedUser };
      generateTableRows(data);
      $("#editModal").modal("hide");
    })
    .catch((error) => {
      $("#editModal").modal("hide");
      console.log("Editt error: ", error);
    });
}

function deleteDocument(userId) {
  const userDocRef = doc(
    db,
    `users/forms/`,
    window.localStorage.getItem("uid"),
    userId
  );
  deleteDoc(userDocRef)
    .then((data) => {
      console.log("removed success");
    })
    .catch((error) => {
      console.log("removed error", error);
    });
}

export function deleteRow(index) {
  const userId = data[index].id;
  deleteDocument(userId);
  data.splice(index, 1);
  generateTableRows(data);
}

export function filterDataForm() {
  const genderElements = document.querySelectorAll(
    "input.gender-checkbox:checked"
  );
  const cityElements = document.querySelectorAll("input.city-checkbox:checked");
  const cities = Array.from(cityElements).map((el) => el.value);
  const genders = Array.from(genderElements).map((el) => el.value);

  let nestedDocRef = collection(
    db,
    `users/forms/${window.localStorage.getItem("uid")}`
  );
  if (genders.length > 0) {
    nestedDocRef = query(nestedDocRef, where("gender", "in", genders));
  }
  if (cities.length > 0) {
    nestedDocRef = query(nestedDocRef, where("city", "in", cities));
  }

  getDocs(nestedDocRef)
    .then((querySnapshot) => {
      data.length = 0;
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        docData.id = doc.id;
        data.push(docData);
      });
      generateTableRows(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

window.editSaveChanges = editSaveChanges;
window.openEditModal = openEditModal;
window.deleteRow = deleteRow;
