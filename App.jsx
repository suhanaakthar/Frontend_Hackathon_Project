import React, { useEffect, useRef } from "react";

import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import parse, { domToReact } from "html-react-parser";

import { pages } from "./pages/pageMap";

import "./style.css";




const oldPagePaths = {

  "index.html": "/",

  "login.html": "/login",

  "register.html": "/register",

  "dashboard.html": "/dashboard",

  "freelancers.html": "/freelancers",

  "jobs.html": "/jobs",

  "profile.html": "/profile",

  "post-job.html": "/post-job",

};



function toReactPath(href = "") {

  const [file, ...hashParts] = href.split("#");

  const path = oldPagePaths[file] || href;

  return hashParts.length ? `${path}#${hashParts.join("#")}` : path;

}



function PageContent({ page }) {

  const rootRef = useRef(null);

  const navigate = useNavigate();

  const location = useLocation();



  useEffect(() => {

    document.title = page.title;

    const root = rootRef.current;

    if (!root) return;

    // Show the correct navigation actions for the current login state.
    const updateNavbar = () => {
      const navActions = root.querySelector(".nav-actions");
      if (!navActions) return;

      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      } catch {
        localStorage.removeItem("currentUser");
      }

      if (currentUser) {
        navActions.innerHTML = `
          <a class="btn btn-outline btn-sm" href="profile.html">Profile</a>
          <button class="btn btn-gold btn-sm logout-btn" type="button">Logout</button>
        `;
      } else {
        navActions.innerHTML = `
          <a class="btn btn-outline btn-sm" href="login.html">Login</a>
          <a class="btn btn-gold btn-sm" href="register.html">Sign Up</a>
        `;
      }
    };
    updateNavbar();



    const toast = (message) => {

      let el = document.querySelector(".toast");

      if (!el) {

        el = document.createElement("div");

        el.className = "toast";

        document.body.appendChild(el);

      }

      el.textContent = message;

      el.classList.add("show");

      window.clearTimeout(window.__freelanceHubToastTimer);

      window.__freelanceHubToastTimer = window.setTimeout(() => el.classList.remove("show"), 2500);

    };



    const setInvalid = (field, invalid) => {

      if (field) field.classList.toggle("invalid", invalid);

    };

    const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);



    // Require a signed-in account before showing the dashboard or personal profile.
    if (["/dashboard", "/profile"].includes(location.pathname)) {
      const savedUser = localStorage.getItem("currentUser");
      if (!savedUser) {
        navigate("/login", { replace: true });
        return;
      }
      if (location.pathname === "/profile") {
        try {
          const user = JSON.parse(savedUser);
          const name = (user.name || "User").trim();
          const profile = JSON.parse(localStorage.getItem("freelanceHubProfile") || "{}");
          const heading = root.querySelector(".profile-header h1");
          const role = root.querySelector(".profile-header .profile-title");
          const meta = root.querySelector(".profile-header .profile-meta");
          const avatar = root.querySelector(".profile-header .avatar");
          if (heading) heading.textContent = name;
          if (role) role.textContent = profile.title || (user.role === "freelancer" ? "Freelancer" : "Client");
          if (meta) meta.innerHTML = `<span>${user.email || ""}</span>`;
          if (avatar) {
            const parts = name.split(/\\s+/);
            avatar.textContent = parts[0][0].toUpperCase() +
              (parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "");
          }

          const about = root.querySelector("#profileAbout");
          const skills = root.querySelector("#profileSkills");
          const experience = root.querySelector("#profileExperience");
          const portfolio = root.querySelector("#profilePortfolio");
          if (about) about.textContent = profile.about || "You haven't added an About section yet.";
          if (skills) skills.textContent = profile.skills || "No skills added yet.";
          if (experience) experience.textContent = profile.experience || "No experience added yet.";
          if (portfolio) portfolio.textContent = profile.portfolio || "No portfolio projects added yet.";

          const fields = {
            profileTitle: profile.title || "",
            profileAboutInput: profile.about || "",
            profileSkillsInput: profile.skills || "",
            profileExperienceInput: profile.experience || "",
            profilePortfolioInput: profile.portfolio || ""
          };
          Object.entries(fields).forEach(([id, value]) => {
            const input = root.querySelector(`#${id}`);
            if (input) input.value = value;
          });
        } catch {
          localStorage.removeItem("currentUser");
          navigate("/login", { replace: true });
          return;
        }
      }
    }

    // Keep the existing prototype's logged-in user visible on the dashboard.

    if (location.pathname === "/dashboard") {

      const savedUser = localStorage.getItem("currentUser");

      if (!savedUser) {

        navigate("/login", { replace: true });

        return;

      }

      try {

        const user = JSON.parse(savedUser);

        const name = (user.name || "User").trim();

        const welcome = root.querySelector("#userName");

        const profileName = root.querySelector("#profileName");

        const avatar = root.querySelector("#profileAvatar");

        if (welcome) welcome.textContent = name;

        if (profileName) profileName.textContent = name;

        if (avatar) {

          const parts = name.split(/\s+/);

          avatar.textContent = parts[0][0].toUpperCase() +

            (parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "");

        }

      } catch {

        localStorage.removeItem("currentUser");

        navigate("/login", { replace: true });

        return;

      }

    }



    const onClick = (event) => {
      // Navbar links are inserted dynamically, so route them through React Router.
      const internalLink = event.target.closest("a[href]");
      if (internalLink) {
        const href = internalLink.getAttribute("href") || "";
        const oldFile = href.split("#")[0];
        if (oldPagePaths[oldFile]) {
          event.preventDefault();
          navigate(toReactPath(href));
          return;
        }
      }

      const logoutButton = event.target.closest(".logout-btn");
      if (logoutButton) {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        updateNavbar();
        navigate("/", { replace: true });
        return;
      }


      const toggle = event.target.closest(".nav-toggle");

      if (toggle) {

        root.querySelector(".navbar")?.classList.toggle("open");

        return;

      }



      const categoryCard = event.target.closest(".category-card[data-category]");

      if (categoryCard) {

        navigate(`/freelancers?category=${encodeURIComponent(categoryCard.dataset.category)}`);

        return;

      }



      const hire = event.target.closest(".hire-btn");

      if (hire) {

        const name = hire.closest(".card")?.dataset.name || "freelancer";

        toast(`Hire request sent to ${name}!`);

        return;

      }



      const apply = event.target.closest(".apply-btn");

      if (apply) {

        const title = apply.closest(".job-card")?.dataset.title || "this job";

        toast(`Application submitted for "${title}"!`);

        return;

      }



      if (event.target.closest("#hireMeBtn")) {

        toast("Hire request sent!");

        return;

      }

      if (event.target.closest("#contactBtn")) {

        toast("Message window would open here.");

        return;

      }

      if (event.target.closest("#postAnotherBtn")) {

        const form = root.querySelector("#postJobForm");

        const success = root.querySelector("#postJobSuccess");

        if (form) form.reset();

        if (form) form.style.display = "";

        if (success) success.style.display = "none";

      }

    };



    const applyFreelancerFilters = () => {

      const grid = root.querySelector("#freelancerGrid");

      if (!grid) return;

      const search = root.querySelector("#freelancerSearch")?.value.trim().toLowerCase() || "";

      const category = root.querySelector("#categoryFilter")?.value || "all";

      const skill = root.querySelector("#skillFilter")?.value || "all";

      let count = 0;

      grid.querySelectorAll(".card").forEach((card) => {

        const skills = (card.dataset.skills || "").toLowerCase();

        const name = (card.dataset.name || "").toLowerCase();

        const show = (!search || name.includes(search) || skills.includes(search)) &&

          (category === "all" || category === card.dataset.category) &&

          (skill === "all" || skills.includes(skill.toLowerCase()));

        card.style.display = show ? "" : "none";

        if (show) count++;

      });

      const countEl = root.querySelector("#resultsCount");

      if (countEl) countEl.textContent = `${count} freelancer${count === 1 ? "" : "s"} found`;

    };



    const applyJobFilters = () => {

      const grid = root.querySelector("#jobGrid");

      if (!grid) return;

      const search = root.querySelector("#jobSearch")?.value.trim().toLowerCase() || "";

      const category = root.querySelector("#jobCategoryFilter")?.value || "all";

      let count = 0;

      grid.querySelectorAll(".job-card").forEach((card) => {

        const title = (card.dataset.title || "").toLowerCase();

        const show = (!search || title.includes(search)) &&

          (category === "all" || category === card.dataset.category);

        card.style.display = show ? "" : "none";

        if (show) count++;

      });

      const countEl = root.querySelector("#jobResultsCount");

      if (countEl) countEl.textContent = `${count} job${count === 1 ? "" : "s"} found`;

    };



    const onInput = (event) => {

      if (["freelancerSearch", "categoryFilter", "skillFilter"].includes(event.target.id)) {

        applyFreelancerFilters();

      }

      if (["jobSearch", "jobCategoryFilter"].includes(event.target.id)) {

        applyJobFilters();

      }

    };



    // Apply query-string filters when arriving from the home page.

    const params = new URLSearchParams(location.search);

    const category = root.querySelector("#categoryFilter");

    const freelancerSearch = root.querySelector("#freelancerSearch");

    if (category && params.get("category")) category.value = params.get("category");

    if (freelancerSearch && params.get("search")) freelancerSearch.value = params.get("search");

    applyFreelancerFilters();

    applyJobFilters();



    const onSubmit = (event) => {

      const form = event.target;

      if (!(form instanceof HTMLFormElement)) return;



      if (form.id === "heroSearchForm") {

        event.preventDefault();

        const keyword = root.querySelector("#heroSearchInput")?.value.trim() || "";

        navigate(`/freelancers?search=${encodeURIComponent(keyword)}`);

      }



      if (form.id === "loginForm") {

        event.preventDefault();

        const nameInput = root.querySelector("#loginName");

        const emailInput = root.querySelector("#loginEmail");

        const passwordInput = root.querySelector("#loginPassword");

        const nameField = nameInput?.closest(".field");

        const emailField = emailInput?.closest(".field");

        const passwordField = passwordInput?.closest(".field");

        const nameOk = !nameInput || !nameInput.value.trim() || nameInput.value.trim().length >= 2;

        const emailOk = validEmail(emailInput?.value.trim() || "");

        const passwordOk = (passwordInput?.value || "").length >= 6;

        setInvalid(nameField, !nameOk);

        setInvalid(emailField, !emailOk);

        setInvalid(passwordField, !passwordOk);

        if (!nameOk || !emailOk || !passwordOk) return;



        const users = JSON.parse(localStorage.getItem("freelanceHubUsers") || "[]");

        const email = emailInput.value.trim().toLowerCase();

        const registered = users.find(
          (user) => (user.email || "").toLowerCase() === email
        );

        // Only accounts created through Sign Up may log in.
        if (!registered) {
          setInvalid(emailField, true);
          toast("Account not found. Please sign up first.");
          return;
        }

        if (registered.password !== passwordInput.value) {
          setInvalid(passwordField, true);
          toast("Incorrect password. Please try again.");
          return;
        }

        localStorage.setItem("currentUser", JSON.stringify({
          name: registered.name,
          email: registered.email,
          role: registered.role || "client",
        }));

        updateNavbar();
        toast("Login successful!");
        navigate("/dashboard");

      }



      if (form.id === "registerForm") {

        event.preventDefault();

        const name = root.querySelector("#fullName")?.value.trim() || "";

        const email = root.querySelector("#registerEmail")?.value.trim() || "";

        const password = root.querySelector("#registerPassword")?.value || "";

        const confirm = root.querySelector("#confirmPassword")?.value || "";

        const nameField = root.querySelector("#nameField");

        const emailField = root.querySelector("#registerEmailField");

        const passwordField = root.querySelector("#registerPasswordField");

        const confirmField = root.querySelector("#confirmPasswordField");

        const nameOk = name.length >= 2;

        const emailOk = validEmail(email);

        const passwordOk = password.length >= 6;

        const confirmOk = confirm === password && confirm.length > 0;

        setInvalid(nameField, !nameOk);

        setInvalid(emailField, !emailOk);

        setInvalid(passwordField, !passwordOk);

        setInvalid(confirmField, !confirmOk);

        if (!nameOk || !emailOk || !passwordOk || !confirmOk) return;



        const role = root.querySelector('input[name="userType"]:checked')?.value || "client";

        const users = JSON.parse(localStorage.getItem("freelanceHubUsers") || "[]");

        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {

          setInvalid(emailField, true);

          toast("An account with this email already exists.");

          return;

        }

        users.push({ name, email, password, role });

        localStorage.setItem("freelanceHubUsers", JSON.stringify(users));

        localStorage.setItem("currentUser", JSON.stringify({ name, email, role }));

        updateNavbar();
        toast("Account created successfully!");

        navigate("/dashboard");

      }



      if (form.id === "profileEditForm") {
        event.preventDefault();
        const profile = {
          title: root.querySelector("#profileTitle")?.value.trim() || "",
          about: root.querySelector("#profileAboutInput")?.value.trim() || "",
          skills: root.querySelector("#profileSkillsInput")?.value.trim() || "",
          experience: root.querySelector("#profileExperienceInput")?.value.trim() || "",
          portfolio: root.querySelector("#profilePortfolioInput")?.value.trim() || ""
        };
        localStorage.setItem("freelanceHubProfile", JSON.stringify(profile));
        toast("Profile details saved!");
        navigate("/profile");
        return;
      }

      if (form.id === "postJobForm") {

        event.preventDefault();

        const checks = [

          ["jobTitleField", "jobTitle", (v) => v.trim().length >= 4],

          ["jobDescriptionField", "jobDescription", (v) => v.trim().length >= 20],

          ["jobCategoryField", "jobCategory", (v) => v !== ""],

          ["jobSkillsField", "jobSkills", (v) => v.trim().length >= 2],

          ["jobBudgetField", "jobBudget", (v) => Number(v) > 0],

          ["jobDeadlineField", "jobDeadline", (v) => v !== ""],

        ];

        let valid = true;

        checks.forEach(([fieldId, inputId, check]) => {

          const field = root.querySelector(`#${fieldId}`);

          const input = root.querySelector(`#${inputId}`);

          const ok = input && check(input.value);

          setInvalid(field, !ok);

          if (!ok) valid = false;

        });

        if (!valid) return;



        const jobs = JSON.parse(localStorage.getItem("freelanceHubJobs") || "[]");

        jobs.push({

          title: root.querySelector("#jobTitle").value.trim(),

          description: root.querySelector("#jobDescription").value.trim(),

          category: root.querySelector("#jobCategory").value,

          skills: root.querySelector("#jobSkills").value.trim(),

          budget: root.querySelector("#jobBudget").value,

          deadline: root.querySelector("#jobDeadline").value,

          experience: root.querySelector("#jobExperience")?.value || "intermediate",

          postedAt: new Date().toISOString(),

        });

        localStorage.setItem("freelanceHubJobs", JSON.stringify(jobs));

        form.style.display = "none";

        const success = root.querySelector("#postJobSuccess");

        if (success) success.style.display = "block";

        toast("Job posted successfully!");

      }

    };



    // Highlight the selected account type on the registration form.

    const onChange = (event) => {

      if (event.target.name === "userType") {

        root.querySelectorAll(".user-type-option").forEach((option) => {

          option.classList.toggle("selected", !!option.querySelector("input")?.checked);

        });

      }

      onInput(event);

    };



    root.addEventListener("click", onClick);

    root.addEventListener("input", onInput);

    root.addEventListener("change", onChange);

    root.addEventListener("submit", onSubmit);



    return () => {

      root.removeEventListener("click", onClick);

      root.removeEventListener("input", onInput);

      root.removeEventListener("change", onChange);

      root.removeEventListener("submit", onSubmit);

    };

  }, [location.pathname, location.search, navigate, page]);



  const content = parse(page.html, {

    replace(domNode) {

      if (domNode.name === "a" && domNode.attribs?.href) {

        const href = domNode.attribs.href;

        if (oldPagePaths[href.split("#")[0]]) {

          return (

            <Link

              to={toReactPath(href)}

              className={domNode.attribs.class}

              id={domNode.attribs.id}

              title={domNode.attribs.title}

              target={domNode.attribs.target}

              rel={domNode.attribs.rel}

            >

              {domToReact(domNode.children || [])}

            </Link>

          );

        }

      }

    },

  });



  return <div ref={rootRef}>{content}</div>;

}



function NotFound() {

  return (

    <main className="section container text-center">

      <h1>Page not found</h1>

      <p>The page you're looking for doesn't exist.</p>

      <Link className="btn btn-gold" to="/">Go to Home</Link>

    </main>

  );

}



function RoutedApp() {

  return (

    <Routes>

      {Object.entries(pages).map(([path, page]) => (

        <Route key={path} path={path} element={<PageContent page={page} />} />

      ))}

      <Route path="*" element={<NotFound />} />

    </Routes>

  );

}



export default function App() {

  return (

    <BrowserRouter>

      <RoutedApp />

    </BrowserRouter>

  );

}
