const path = require('path');
const bcrypt = require('bcrypt');
const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const { DateTime } = require('luxon');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const Blog = require('../models/blog.models');
const { STATUS } = require('../config/blog');
const { getBlogByUrl, createVnFileHtmlEn, createVnFileHtmlVn, createVnFileHtmlBlogen, createVnFileHtmlBlogvn, invalidateAndVnDelete, invalidateAndVnDeleteVn, filesVnExistInS3 } = require('../services/blog-ucademy')
// const { uploadfile } = require('../services/upload');

async function getVnBlog(req, res) {
    const blogUrl = req.params.urlBlog;
    try {
        const blog = await getBlogByUrl(blogUrl);

        blog.view = (blog.view || 0) + 1;
        await blog.save();

        const { code } = blog;
        // Find other blogs with the same ms and language as "VN"
        const relatedBlogs = await Blog.find({ code, urlBlog: { $ne: blogUrl } });
        const relatedBlogInfo = relatedBlogs.length ? relatedBlogs[0] : {};

        // change the date (in the database is a number) of the blog found
        const times = relatedBlogInfo.createdAt;
        const timesdateObj = new Date(times * 1000);
        const timesformattedDate = timesdateObj.toDateString("en-US");

        const timestamp = blog.createAt;
        const dateTime = new Date(timestamp * 1000);
        const formattedDate = dateTime.toDateString("en-US");
        const categories = blog.category.map(cat => `<div class="badge badge-pill badge-success g-6" style="background: #ed3312; margin-left: 5px;" data-t>${cat}</div>`).join('');
        const categoriesBlog = relatedBlogInfo.category.map(cat => `<div class="badge badge-pill badge-success g-6" style="background: #ed3312; margin-left: 5px;" data-t>${cat}</div>`).join('');
        
        // generate html into ucademy-corporate-site/dist/blog
        const htmldist = `
      <!doctype html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <meta name="robots" content="index,follow">
          <meta name="copyright" content="Ucademy">
          <meta name="description" content="${blog.metaBlog}">
          <meta name="detail" content="e-Learning platform">
          <link rel="canonical" href="${blog.urlBlog}.html">
          <meta name="keywords"
              content="ucademy, learning, corporate, lms, online, marketing, saas, paas, training, startup, ucademy.vn">
          <meta name="author" content="Ucademy">
          <meta name="og:site_name" content="Ucademy">
          <meta property="og:title" content="${blog.metaBlog}">
          <meta property="og:url" content="https://ucademy.vn/blog/${blog.urlBlog}.html">
          <meta property="og:description" content="${blog.introduce}">
          <meta property="og:type" content="website">
          <meta property="og:image" content="${blog.imageUrl}">
          <meta property="og:image:alt" content="e-Learning platform">
          <link rel="icon" href="path-to-your-favicon.ico" type="image/x-icon">
          <title>${blog.titleBlog} || ucademy.vn</title>
          <link rel="shortcut icon" type="image/x-icon" href="/img/e12163.png">
          <link rel="stylesheet" href="../css/plugins.css">
          <link rel="stylesheet" href="../css/style.css">
          <link rel="stylesheet" href="../css/colors/grape.css">
          <link rel="stylesheet" href=".././css/colors/black.css">
          <link rel="preload" as="style"  href="../css/fonts/urbanist.css" onload="this.rel='stylesheet'">
          <link href="/css/plugins.css rel="stylesheet">
          <link href="/css/style.css" rel="stylesheet">
          <link href="/css/colors/black.css" rel="stylesheet">
          <link href="/css/colors/grape.css" rel="stylesheet">
          <link href="/css/fonts/avenirNext.css" rel="stylesheet">
      </head>
      <body>
          <div class="content-wrapper">
              <header class="wrapper">
                  <nav class="navbar navbar-expand-lg center-nav transparent navbar-light">
                      <div class="container flex-lg-row flex-nowrap align-items-center">
                          <div class="navbar-brand w-100"><a href="/index.html"><img src="/img/64fc46.png"
                                      srcset="/img/431cd4.png 2x" alt></a></div>
                          <div class="navbar-collapse offcanvas-nav">
                              <div class="offcanvas-header d-lg-none d-xl-none"><a href="/index.html"><img
                                          src="/img/92e42d.png" srcset="/img/f67702.png 2x" alt></a><button type="button"
                                      class="btn-close btn-close-white offcanvas-close offcanvas-nav-close"
                                      aria-label="Close"></button></div>
                              <ul class="navbar-nav">
                                  <li class="nav-item dropdown"><a class="nav-link" href="/index.html">Home</a></li>
                                  <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#!">Product</a>
                                      <ul class="dropdown-menu">
                                          <li class="nav-item"><a class="dropdown-item"
                                                  href="/product_overview.html">Overview</a></li>
                                          <li class="nav-item"><a class="dropdown-item"
                                                  href="/product_features.html">Features</a></li>
                                      </ul>
                                  </li>
                                  <li class="nav-item dropdown"><a class="nav-link" href="/pricing.html">Pricing</a></li>
                                  <li class="nav-item dropdown"><a class="nav-link" href="/contact.html">Contact Us</a></li>
                                  <li class="nav-item dropdown"><a class="nav-link" href="/blog.html">Blog</a></li>
                              </ul>
                          </div>
                          <div class="navbar-other w-100 d-flex ms-auto">
                              <ul class="navbar-nav flex-row align-items-center ms-auto" data-sm-skip="true">
                                  <li class="nav-item dropdown language-select text-uppercase"><a
                                          class="nav-link dropdown-item dropdown-toggle btn-lang-set" href="#" role="button"
                                          data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">En</a>
                                      <ul class="dropdown-menu">
                                          <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                                  data-select="en"
                                                  href="/en/blog/${blog.urlBlog}.html">En</a>
                                          </li>
                                          <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                                  data-select="vn"
                                                  href="/blog/${relatedBlogInfo.urlBlog}.html">Vn</a>
                                          </li>
                                      </ul>
                                  </li>
                                  <li class="nav-item d-none d-md-block"><a class="btn btn-sm btn-primary rounded-pill"
                                          href="/register.html">Try it free!</a></li>
                                  <li class="nav-item d-lg-none">
                                      <div class="navbar-hamburger"><button type="button" name="btn-nav"
                                              class="hamburger animate plain"
                                              data-toggle="offcanvas-nav"><span></span></button></div>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </nav>
              </header>
          </div>
          <section class="wrapper bg-soft-primary angled upper-end lower-start">
              <div class="container py-5 py-md-15 text-center">
                  <div class="row">
                      <div class="col-md-7 col-lg-6 col-xl-6 mx-auto">
                          <h1 class="blog-back display-2 mb-3">Blog News</h1>
                          <p class="px-lg-2 px-xxl-8 mb-0 lead-blog">Welcome to our journal.<br>Here you can find the latest
                              company news.</p>
                      </div>
                  </div>
              </div>
          </section>
          <section class="wrapper bg-light">
              <div class="container py-14 py-md-6">
                  <div class="blog">
                      <article class="post">
                          <div class="card">
                              <div class="overlay-box"><img class="ms-xl-5"
                                      src=${blog.imageUrl}
                                      style="width:70%;object-fit:contain;vertical-align:text-to" alt></div>
                              <div class="card-body">
                                  <div class="post-header">
                                      <h2 class="post-title mt-1 mb-0">${blog.title}</h2>
                                  </div>
                                  <div class="col-md-12">
                                      <ul class="post-meta mb-0 blog-i-fas">
                                          <li class="post-date blog-i-fas"><i class="uil uil-user"></i><span>${blog.author}</span></li>
                                          <li class="post-author blog-i-fas"><i class="uil uil-calendar-alt"></i><span>${formattedDate}</span></li>
                                          <li class="post-comments blog-i-fas"><i class="uil uil-eye"></i><span>${blog.view}</span>
                                          </li>
                                      </ul>
                                  </div>
                                  <p class="card-text blog-text"><span>${categories}</span></p>
                                  <div class="post-content">
                                      <p class="blog-back" data-t>${blog.description}</p>
                                  </div>
                              </div>
                          </div>
                      </article>
                  </div>
              </div>
          </section>
          <section class="wrapper bg-light mb-12">
              <div class="container py-1 pt-md-1 pb-md-1">
                  <div class="row align-items-center mb-5">
                      <div class="col-md-8 col-lg-3 col-xl-8 col-xxl-7 pe-xl-20">
                          <h3 class="display-7 mb-0">Related Articles</h3>
                      </div>
                      <div class="col-md-4 col-lg-3 ms-md-auto text-md-end mt-5 mt-md-0"><a
                              class="rounded-pill mb-0 blog-all-text" href="/en/blog.html">All articles</a></div>
                      <article class="post">
                          <div class="card">
                              <div class="post-slider card-img-top">
                                  <div class="swiper-container dots-over" data-margin="5" data-nav="true" data-dots="true">
                                      <div class="swiper"></div>
                                  </div>
                              </div>
                          </div>
                      </article>
                  </div>
                  <div class="blog-card mb-1" id="hover-blog-2"><a class="blog-back"
                          href="/en/blog/10-tips-for-creating-an-engaging-teaching-video.html">
                          <div class="card-body p-2 pb-0">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-0 blog-backen">10 tips for creating an engaging teaching
                                          video</h4>
                                      <div class="card">
                                          <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                              data-dots="true"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </a>
                      <div class="hover-blog" id="hovered-blog-2"><a class="blog-back"
                              href="/en/blog/10-tips-for-creating-an-engaging-teaching-video.html">
                              <div class="card-body p-2 pb-0 container">
                                  <div class="row">
                                      <div class="post-header mb-1">
                                          <h4 class="post-title-blog mb-1 hover-blog-title">10 tips for creating an engaging
                                              teaching video</h4>
                                      </div>
                                      <p class="card-text blob-text pb-md-0 hover-blog_test">Lights. Camera. Action! Welcome
                                          to the world of cinematic education, where creativity meets technology to create
                                          powerful and engaging educational videos. Creating an educational video that
                                          captures the attention of your audience and delivers your message effectively
                                          requires a combination of creativity, technical skills, and an understanding of your
                                          audience.</p>
                                  </div>
                              </div>
                          </a></div>
                  </div>
                  <div class="blog-card mb-1" id="hover-blog-3"><a class="blog-back"
                          href="/en/blog/how-to-build-a-successful-customer-training-program.html">
                          <div class="card-body p-2 pb-0">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-0 blog-backen">How to build a successful customer training
                                          program</h4>
                                      <div class="card">
                                          <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                              data-dots="true"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </a>
                      <div class="hover-blog" id="hovered-blog-3"><a class="blog-back"
                              href="/en/blog/how-to-build-a-successful-customer-training-program.html">
                              <div class="card-body p-2 pb-0 container">
                                  <div class="row">
                                      <div class="post-header mb-1">
                                          <h4 class="post-title-blog mb-1 hover-blog-title">How to build a successful customer
                                              training program</h4>
                                      </div>
                                      <p class="card-text blob-text pb-md-0 hover-blog_test">The evolution of customer
                                          training has been driven by the importance of providing a superior customer
                                          experience. As businesses strive to differentiate themselves from their competitors,
                                          they have realized that providing exceptional customer service is key to building
                                          long-lasting relationships with their customers. </p>
                                  </div>
                              </div>
                          </a></div>
                  </div>
                  <div class="blog-card mb-1" id="hover-blog-4"><a class="blog-back"
                          href="/en/blog/how-to-determine-the-price-of-your-online-courses.html">
                          <div class="card-body p-2 pb-0">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-0 blog-backen">How to Determine the Price of Your Online
                                          Courses</h4>
                                      <div class="card">
                                          <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                              data-dots="true"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </a>
                      <div class="hover-blog" id="hovered-blog-4"><a class="blog-back"
                              href="/en/blog/how-to-determine-the-price-of-your-online-courses.html">
                              <div class="card-body p-2 pb-0 container">
                                  <div class="row">
                                      <div class="post-header mb-1">
                                          <h4 class="post-title-blog mb-1 hover-blog-title">How to Determine the Price of Your
                                              Online Courses</h4>
                                      </div>
                                      <p class="card-text blob-text pb-md-0 hover-blog_test">In recent years, online courses
                                          have become increasingly popular, especially with the emergence of e-learning
                                          platforms. Pricing your online course is one of the most critical decisions you will
                                          make in your course creation process.</p>
                                  </div>
                              </div>
                          </a></div>
                  </div>
                  <div class="blog-card mb-1" id="hover-blog-5"><a class="blog-back"
                          href="/en/blog/why-employees-do-not-engage-with-your-training-programs.html">
                          <div class="card-body p-2 pb-0">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-0 blog-backen">Why employees do not engage with your
                                          training programs</h4>
                                      <div class="card">
                                          <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                              data-dots="true"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </a>
                      <div class="hover-blog" id="hovered-blog-5"><a class="blog-back"
                              href="/en/blog/why-employees-do-not-engage-with-your-training-programs.html">
                              <div class="card-body p-2 pb-0 container">
                                  <div class="row">
                                      <div class="post-header mb-1">
                                          <h4 class="post-title-blog mb-1 hover-blog-title">Why employees do not engage with
                                              your training programs</h4>
                                      </div>
                                      <p class="card-text blob-text pb-md-0 hover-blog_test">Engaging employees in training
                                          programs is crucial to the success of any organization. Like Microsoft, beside its
                                          leading innovative products and services, the company’s success is largely
                                          attributed to its employee engagement and training programs. </p>
                                  </div>
                              </div>
                          </a></div>
                  </div>
                  <div class="blog-text-all"><a class="rounded-pill mb-0 blog-all-text" href="/en/blog.html">All articles</a>
                  </div>
              </div>
          </section>
          <footer class="bg-light">
              <div class="container-card">
                  <div class="card image-wrapper bg-full bg-image bg-overlay bg-overlay-light-500 mb-14 bg-image-home-bg22"
                      data-image-src=".././assets/img/photos/bg22.png">
                      <div class="card-body py-14 px-0">
                          <div class="container">
                              <div class="row text-center">
                                  <div class="col-xl-11 col-xxl-9 mx-auto">
                                      <h2 class="fs-16 text-uppercase text-gradient gradient-1 mb-3">Join Our Community</h2>
                                      <h3 class="display-4 mb-7 px-lg-17">We are building over 1000+ online schools and
                                          training centers. Join them now and grow your business.</h3>
                                  </div>
                              </div>
                              <div class="d-flex justify-content-center"><span><a
                                          class="btn btn-lg btn-gradient gradient-1 rounded" href="/register.html">Try it
                                          free!</a></span></div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="container pb-13 pb-md-15">
                  <div class="row gy-6 gy-lg-0">
                      <div class="col-md-4 col-lg-3">
                          <div class="widget"><img class="mb-4" src="/img/64fc46.png" srcset="/img/431cd4.png 2x" alt>
                              <p class="mb-4"><span id="year-copyright"></span> Dicom Interactive. <br
                                      class="d-none d-lg-block"> All rights reserved.</p>
                              <nav class="nav social"><a href="https://www.linkedin.com/company/dicom-interactive/"><i
                                          class="uil uil-linkedin"></i></a> <a
                                      href="https://www.facebook.com/dicominteractive"><i class="uil uil-facebook-f"></i></a>
                              </nav>
                          </div>
                      </div>
                      <div class="col-md-4 col-lg-3">
                          <div class="widget">
                              <h4 class="widget-title mb-3">Get In Touch</h4>
                              <address class="pe-xl-15 pe-xxl-17">81 Cach Mang Thang Tam, Ben Thanh ward, District 1, HCMC,
                                  Vietnam.</address><a href="mailto:hello@ucademy.vn"
                                  class="link-body">hello@ucademy.vn</a><br>
                              <div class="flag-number-phone"><span
                                      style="margin-bottom:0">(+61) 390 1878 86</span></div>
                              <div class="flag-number-phone"> <span
                                      style="margin-bottom:0">(+84) 287 1065 144</span></div>
                          </div>
                      </div>
                      <div class="col-md-4 col-lg-3">
                          <div class="widget">
                              <h4 class="widget-title mb-3">Learn More</h4>
                              <ul class="list-unstyled text-reset mb-0">
                                  <li><a href="/en/index.html">Home</a></li>
                                  <li><a href="/en/product_overview.html">Product Overview</a></li>
                                  <li><a href="/en/product_features.html">Product Features</a></li>
                                  <li><a href="/en/pricing.html">Pricing</a></li>
                                  <li><a href="/en/contact.html">Contact Us</a></li>
                                  <li><a href="/en/blog.html">Blog</a></li>
                              </ul>
                          </div>
                      </div>
                      <div class="col-md-12 col-lg-3">
                          <div class="widget">
                              <h4 class="widget-title mb-3">Our Newsletter</h4>
                              <p class="mb-5">Subscribe to our newsletter to get our news & deals delivered to you.</p>
                              <div class="newsletter-wrapper">
                                  <div id="mc_embed_signup2">
                                      <form action="https://api.ucademy.vn/newsletter" method="post"
                                          id="mc-embedded-subscribe-form2" name="mc-embedded-subscribe-form" class="validate"
                                          novalidate>
                                          <div class="messages-email"></div>
                                          <div id="mc_embed_signup_scroll2">
                                              <div class="mc-field-group input-group form-floating"><input type="email"
                                                      name="EMAIL" class="form-control" id="mce-EMAIL2" required
                                                      placeholder="Email Address"> <label for="mce-EMAIL2">Email
                                                      Address</label> <input type="submit" name="subscribe"
                                                      id="mc-embedded-subscribe2"
                                                      class="btn btn-primary btn-gradient gradient-1" value="Join"></div>
                                              <div id="mce-responses2" class="clear">
                                                  <div class="response" id="mce-error-response2" style="display:none"></div>
                                                  <div class="response" id="mce-success-response2" style="display:none"></div>
                                              </div>
                                          </div>
                                      </form>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </footer>
          <div class="progress-wrap"><svg class="progress-circle svg-content" width="100%" height="100%"
                  viewbox="-1 -1 102 102">
                  <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
              </svg></div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js"
              integrity="sha512-pax4MlgXjHEPfCwcJLQhigY7+N8rt6bVvWLFyUMuxShv170X53TRzGPmPkZmGBhk+jikR8WBM4yl7A9WMHHqvg=="
              crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
              integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
              crossorigin="anonymous"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"
              integrity="sha512-37T7leoNS06R80c8Ulq7cdCDU5MNQBwlYoy1TX/WUsLFC2eYNqtKlV0QjH7r8JpG/S0GUMZwebnVFLPd6SU5yg=="
              crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js"
              integrity="sha512-XZEy8UQ9rngkxQVugAdOuBRDmJ5N4vCuNXCh8KlniZgDKTvf7zl75QBtaVG1lEhMFe2a2DuA22nZYY+qsI2/xA=="
              crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <script defer="defer" src="/js/plugins.js"></script>
          <script defer="defer" src="/js/theme.js"></script>
          <script defer="defer" src="/js/validatePassword.js"></script>
          <script defer="defer" src="/js/callAPI.js"></script>
          <script defer="defer" src="/js/apiBlog.js"></script>
          <script defer="defer" src="/js/hoverArticles.js"></script>
      </body>
      </html>
    `;
        // create html into ucademy-corporate-site/dist/vn/blog
        const htmlvn = `
    <!doctype html>
    <html lang="en">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="robots" content="index,follow">
        <meta name="copyright" content="Ucademy">
        <meta name="description" content="Cập nhật nhanh chóng các bài viết và tin tức mới nhất từ Ucademy!">
        <meta name="detail" content="Nền tảng học trực tuyến">
        <meta name="keywords"
            content="ucademy, learning, corporate, lms, online, marketing, saas, paas, training, startup, ucademy.vn">
        <meta name="author" content="Ucademy">
        <meta name="og:site_name" content="Ucademy">
        <meta property="og:title" content="${relatedBlogInfo.metaBlog}">
        <meta property="og:url" content-t="${relatedBlogInfo.urlBlog}.html">
        <meta property="og:description"
            content="${relatedBlogInfo.introduce}">
        <meta property="og:type" content="website">
        <meta property="og:image" content="${relatedBlogInfo.imageUrl}">
        <meta property="og:image:alt" content="Nền tảng học trực tuyến">
        <title>${relatedBlogInfo.urlBlog}</title>
        <link rel="shortcut icon" type="image/x-icon" href="/img/e12163.png">
        <link rel="stylesheet" href="../../css/plugins.css">
        <link rel="stylesheet" href="../../css/style.css">
        <link rel="stylesheet" href="../../css/colors/grape.css">
        <link rel="stylesheet" href="../../css/colors/black.css">
        <link rel="preload" as="style" href="../../css/fonts/avenirNext.css" onload="this.rel='stylesheet'">
        <link href="/css/plugins.css" rel="stylesheet">
        <link href="/css/style.css" rel="stylesheet">
        <link href="/css/colors/black.css" rel="stylesheet">
        <link href="/css/colors/grape.css" rel="stylesheet">
        <link href="/css/fonts/avenirNext.css" rel="stylesheet">
    </head>

    <body>
        <div class="content-wrapper">
            <header class="wrapper">
                <nav class="navbar navbar-expand-lg center-nav transparent navbar-light">
                    <div class="container flex-lg-row flex-nowrap align-items-center">
                        <div class="navbar-brand w-100"><a href="/index.html"><img src="/img/64fc46.png"
                                    srcset="/img/431cd4.png 2x" alt></a></div>
                        <div class="navbar-collapse offcanvas-nav">
                            <div class="offcanvas-header d-lg-none d-xl-none"><a href="/index.html"><img
                                        src="/img/92e42d.png" srcset="/img/f67702.png 2x" alt></a><button type="button"
                                    class="btn-close btn-close-white offcanvas-close offcanvas-nav-close"
                                    aria-label="Close"></button></div>
                            <ul class="navbar-nav">
                                <li class="nav-item dropdown"><a class="nav-link" href="/index.html">Trang chủ</a></li>
                                <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#!">Sản phẩm</a>
                                    <ul class="dropdown-menu">
                                        <li class="nav-item"><a class="dropdown-item" href="/product_overview.html">Tổng
                                                quan sản phẩm</a></li>
                                        <li class="nav-item"><a class="dropdown-item" href="/product_features.html">Tính
                                                năng sản phẩm</a></li>
                                    </ul>
                                </li>
                                <li class="nav-item dropdown"><a class="nav-link" href="/pricing.html">Bảng giá</a></li>
                                <li class="nav-item dropdown"><a class="nav-link" href="/contact.html">Liên hệ</a></li>
                                <li class="nav-item dropdown"><a class="nav-link" href="/blog.html">Blog</a></li>
                            </ul>
                        </div>
                        <div class="navbar-other w-100 d-flex ms-auto">
                            <ul class="navbar-nav flex-row align-items-center ms-auto" data-sm-skip="true">
                                <li class="nav-item dropdown language-select text-uppercase"><a
                                        class="nav-link dropdown-item dropdown-toggle btn-lang-set" href="#" role="button"
                                        data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">En</a>
                                    <ul class="dropdown-menu">
                                        <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                                data-select="en"
                                                href="/en/blog/${blog.urlBlog}.html">En</a></li>
                                        <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                                data-select="vn"
                                                href="/blog/${relatedBlogInfo.urlBlog}.html">Vn</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="nav-item d-none d-md-block"><a class="btn btn-sm btn-primary rounded-pill"
                                        href="/register.html">Dùng thử miễn phí!</a></li>
                                <li class="nav-item d-lg-none">
                                    <div class="navbar-hamburger"><button type="button" name="btn-nav"
                                            class="hamburger animate plain"
                                            data-toggle="offcanvas-nav"><span></span></button></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
        </div>
        <section class="wrapper bg-soft-primary angled upper-end lower-start">
            <div class="container py-5 py-md-15 text-center">
                <div class="row">
                    <div class="col-md-7 col-lg-6 col-xl-6 mx-auto">
                        <h1 class="blog-back display-2 mb-3">Blog News</h1>
                        <p class="px-lg-2 px-xxl-8 mb-0 lead-blog">Cập nhật các bài viết và tin tức mới nhất từ Ucademy!</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="wrapper bg-light">
            <div class="container py-14 py-md-6">
                <div class="blog">
                    <article class="post">
                        <div class="card">
                            <div class="overlay-box"><img class="ms-xl-5" src="${relatedBlogInfo.imageUrl}"
                                    style="width:70%;object-fit:contain;vertical-align:text-to" alt></div>
                            <div class="card-body">
                                <div class="post-header">
                                    <h2 class="post-title mt-1 mb-0">${relatedBlogInfo.title}</h2>
                                </div>
                                <div class="col-md-12">
                                    <ul class="post-meta mb-0 blog-i-fas">
                                        <li class="post-date blog-i-fas"><i class="uil uil-user"></i><span>${relatedBlogInfo.author}</span>
                                        </li>
                                        <li class="post-author blog-i-fas"><i class="uil uil-calendar-alt"></i><span>
                                                ${timesformattedDate}</span></li>
                                        <li class="post-comments blog-i-fas"><i class="uil uil-eye"></i><span>${relatedBlogInfo.view}</span>
                                        </li>
                                    </ul>
                                </div>
                                <p class="card-text blog-text"><span>
                                        ${categoriesBlog}
                                        </span></p>
                                <div class="post-content">
                                    <p class="blog-back" data-t>${relatedBlogInfo.description}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
        <section class="wrapper bg-light mb-12">
            <div class="container py-1 pt-md-1 pb-md-1">
                <div class="row align-items-center mb-5">
                    <div class="col-md-8 col-lg-3 col-xl-8 col-xxl-7 pe-xl-20">
                        <h3 class="display-7 mb-0">Bài viết liên quan</h3>
                    </div>
                    <div class="col-md-4 col-lg-3 ms-md-auto text-md-end mt-5 mt-md-0"><a
                            class="rounded-pill mb-0 blog-all-text" href="/blog.html">Xem tất cả</a></div>
                    <article class="post">
                        <div class="card">
                            <div class="post-slider card-img-top">
                                <div class="swiper-container dots-over" data-margin="5" data-nav="true" data-dots="true">
                                    <div class="swiper"></div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
                <div class="blog-card mb-1" id="hover-blog-2"><a class="blog-back"
                        href="/blog/10-meo-de-tao-mot-video-giang-day-hap-dan.html">
                        <div class="card-body p-2 pb-0">
                            <div class="row">
                                <div class="post-header mb-1">
                                    <h4 class="post-title-blog mb-0 blog-backen">10 mẹo để tạo một video giảng dạy hấp dẫn
                                    </h4>
                                    <div class="card">
                                        <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                            data-dots="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div class="hover-blog" id="hovered-blog-2"><a class="blog-back"
                            href="/blog/10-meo-de-tao-mot-video-giang-day-hap-dan.html">
                            <div class="card-body p-2 pb-0 container">
                                <div class="row">
                                    <div class="post-header mb-1">
                                        <h4 class="post-title-blog mb-1 hover-blog-title">10 mẹo để tạo một video giảng dạy
                                            hấp dẫn</h4>
                                    </div>
                                    <p class="card-text blob-text pb-md-0 hover-blog_test">Đèn. Máy quay. Diễn! Chào mừng
                                        bạn đến với thế giới làm phim giáo dục kiểu điện ảnh, nơi sáng tạo giao thoa với
                                        công nghệ để tạo ra các video giáo dục hiệu quả và hấp dẫn. Tạo ra một video giáo
                                        dục mà thu hút sự chú ý của khán giả và truyền đạt thông điệp của bạn hiệu quả đòi
                                        hỏi sự kết hợp của sáng tạo, kỹ năng kỹ thuật và sự hiểu biết về khán giả của bạn.
                                    </p>
                                </div>
                            </div>
                        </a></div>
                </div>
                <div class="blog-card mb-1" id="hover-blog-3"><a class="blog-back"
                        href="/blog/cach-xay-dung-mot-chuong-trinh-dao-tao-khach-hang-thanh-cong.html">
                        <div class="card-body p-2 pb-0">
                            <div class="row">
                                <div class="post-header mb-1">
                                    <h4 class="post-title-blog mb-0 blog-backen">Cách xây dựng một chương trình đào tạo
                                        khách hàng thành công</h4>
                                    <div class="card">
                                        <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                            data-dots="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div class="hover-blog" id="hovered-blog-3"><a class="blog-back"
                            href="/blog/cach-xay-dung-mot-chuong-trinh-dao-tao-khach-hang-thanh-cong.html">
                            <div class="card-body p-2 pb-0 container">
                                <div class="row">
                                    <div class="post-header mb-1">
                                        <h4 class="post-title-blog mb-1 hover-blog-title">Cách xây dựng một chương trình đào
                                            tạo khách hàng thành công</h4>
                                    </div>
                                    <p class="card-text blob-text pb-md-0 hover-blog_test">Nghiệp vụ đào tạo khách hàng phát
                                        triển nhanh hơn từ khi doanh nghiệp nhận ra tầm quan trọng của việc cung cấp trải
                                        nghiệm khách hàng tuyệt vời. Khi các doanh nghiệp cố gắng tạo sự khác biệt so với
                                        đối thủ cạnh tranh, họ nhận ra rằng cung cấp dịch vụ khách hàng xuất sắc là chìa
                                        khóa để xây dựng mối quan hệ lâu dài với khách hàng.</p>
                                </div>
                            </div>
                        </a></div>
                </div>
                <div class="blog-card mb-1" id="hover-blog-4"><a class="blog-back"
                        href="/blog/chien-luoc-gia-cho-cac-khoa-hoc-truc-tuyen.html">
                        <div class="card-body p-2 pb-0">
                            <div class="row">
                                <div class="post-header mb-1">
                                    <h4 class="post-title-blog mb-0 blog-backen">Chiến lược giá cho các khóa học
                                        trực tuyến</h4>
                                    <div class="card">
                                        <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                            data-dots="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div class="hover-blog" id="hovered-blog-4"><a class="blog-back"
                            href="/blog/chien-luoc-gia-cho-cac-khoa-hoc-truc-tuyen.html">
                            <div class="card-body p-2 pb-0 container">
                                <div class="row">
                                    <div class="post-header mb-1">
                                        <h4 class="post-title-blog mb-1 hover-blog-title">Chiến lược giá cho các
                                            khóa học trực tuyến</h4>
                                    </div>
                                    <p class="card-text blob-text pb-md-0 hover-blog_test">Trong những năm gần đây, dạy học
                                        trực tuyến đã trở nên ngày càng phổ biến, đặc biệt là với sự xuất hiện của các nền
                                        tảng học trực tuyến. Việc định giá cho khóa học trực tuyến của bạn là một trong
                                        những quyết định quan trọng nhất mà bạn sẽ đưa ra trong quá trình tạo khóa học của
                                        mình.</p>
                                </div>
                            </div>
                        </a></div>
                </div>
                <div class="blog-card mb-1" id="hover-blog-5"><a class="blog-back"
                        href="/blog/vi-sao-nhan-vien-khong-muon-tham-gia-chuong-trinh-dao-tao-cua-ban.html">
                        <div class="card-body p-2 pb-0">
                            <div class="row">
                                <div class="post-header mb-1">
                                    <h4 class="post-title-blog mb-0 blog-backen">Vì sao nhân viên không muốn tham gia
                                        chương trình đào tạo của bạn</h4>
                                    <div class="card">
                                        <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                            data-dots="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div class="hover-blog" id="hovered-blog-5"><a class="blog-back"
                            href="/blog/vi-sao-nhan-vien-khong-muon-tham-gia-chuong-trinh-dao-tao-cua-ban.html">
                            <div class="card-body p-2 pb-0 container">
                                <div class="row">
                                    <div class="post-header mb-1">
                                        <h4 class="post-title-blog mb-1 hover-blog-title">Vì sao nhân viên không muốn
                                            tham gia chương trình đào tạo của bạn</h4>
                                    </div>
                                    <p class="card-text blob-text pb-md-0 hover-blog_test">Sự tham gia của nhân viên vào các
                                        chương trình đào tạo là rất quan trọng cho sự thành công của bất kỳ tổ chức, doanh
                                        nghiệp nào. Ví dụ như Microsoft, ngoài dẫn đầu thị trường ở mảng các sản phẩm và
                                        dịch vụ đột phá, thành công của họ còn được ghi nhận ở mảng đào tạo nhân viên.</p>
                                </div>
                            </div>
                        </a></div>
                </div>
                <div class="blog-text-all"><a class="rounded-pill mb-0 blog-all-text" href="/blog.html">Xem tất cả</a>
                </div>
            </div>
        </section>
        <footer class="bg-light">
            <div class="container-card">
                <div class="card image-wrapper bg-full bg-image bg-overlay bg-overlay-light-500 mb-14 bg-image-home-bg22"
                    data-image-src=".././assets/img/photos/bg22.png">
                    <div class="card-body py-14 px-0">
                        <div class="container">
                            <div class="row text-center">
                                <div class="col-xl-11 col-xxl-9 mx-auto">
                                    <h2 class="fs-16 text-uppercase text-gradient gradient-1 mb-3">Tham gia cộng đồng của
                                        chúng tôi</h2>
                                    <h3 class="display-4 mb-7 px-lg-17">Chúng tôi đã và đang xây dựng hơn 1000 trường học và
                                        trung tâm đào tạo trực tuyến. Tham gia với chúng tôi ngay bây giờ và phát triển
                                        doanh nghiệp của bạn.</h3>
                                </div>
                            </div>
                            <div class="d-flex justify-content-center"><span><a
                                        class="btn btn-lg btn-gradient gradient-1 rounded" href="/register.html">Dùng thử
                                        miễn phí</a></span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container pb-13 pb-md-15">
                <div class="row gy-6 gy-lg-0">
                    <div class="col-md-4 col-lg-3">
                        <div class="widget"><img class="mb-4" src="/img/64fc46.png" srcset="/img/431cd4.png 2x" alt>
                            <p class="mb-4"><span id="year-copyright"></span> Dicom Interactive. <br
                                    class="d-none d-lg-block"> Chịu trách nhiệm sản phẩm và nội dung.</p>
                            <nav class="nav social"><a href="https://www.linkedin.com/company/dicom-interactive/"><i
                                        class="uil uil-linkedin"></i></a> <a
                                    href="https://www.facebook.com/dicominteractive"><i class="uil uil-facebook-f"></i></a>
                            </nav>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg-3">
                        <div class="widget">
                            <h4 class="widget-title mb-3">Thông tin liên hệ</h4>
                            <address class="pe-xl-15 pe-xxl-17">81 Cách Mạng Tháng 8, Phường Bến Thành, Quận 1, Thành phố Hồ
                                Chí Minh, Việt Nam.</address><a href="mailto:hello@ucademy.vn"
                                class="link-body">hello@ucademy.vn</a><br>
                            <div class="flag-number-phone"><img src="/img/82de73.png" alt="Australia"> <span
                                    style="margin-bottom:0">(+61) 390 1878 86</span></div>
                            <div class="flag-number-phone"><img src="/img/231f3c.png" alt="Viet Nam"> <span
                                    style="margin-bottom:0">(+84) 287 1065 144</span></div>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg-3">
                        <div class="widget">
                            <h4 class="widget-title mb-3">Tìm hiểu thêm</h4>
                            <ul class="list-unstyled text-reset mb-0">
                                <li><a href="/index.html">Trang chủ</a></li>
                                <li><a href="/product_overview.html">Tổng quan sản phẩm</a></li>
                                <li><a href="/product_features.html">Tính năng sản phẩm</a></li>
                                <li><a href="/pricing.html">Bảng giá</a></li>
                                <li><a href="/contact.html">Liên hệ</a></li>
                                <li><a href="/blog.html">Blog</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-12 col-lg-3">
                        <div class="widget">
                            <h4 class="widget-title mb-3">Bản tin</h4>
                            <p class="mb-5">Đăng ký bảng tin để nhận thông tin cập nhật mới nhất và sớm nhất về sản phẩm,
                                chương trình khuyến mãi.</p>
                            <div class="newsletter-wrapper">
                                <div id="mc_embed_signup2">
                                    <form action="https://api.ucademy.vn/newsletter" method="post"
                                        id="mc-embedded-subscribe-form2" name="mc-embedded-subscribe-form" class="validate"
                                        novalidate>
                                        <div class="messages-email"></div>
                                        <div id="mc_embed_signup_scroll2">
                                            <div class="mc-field-group input-group form-floating"><input type="email"
                                                    name="EMAIL" class="form-control" id="mce-EMAIL2" required
                                                    placeholder="Email của bạn"> <label for="mce-EMAIL2">Email của
                                                    bạn</label> <input type="submit" name="subscribe"
                                                    id="mc-embedded-subscribe2"
                                                    class="btn btn-primary btn-gradient gradient-1" value="Đăng ký"></div>
                                            <div id="mce-responses2" class="clear">
                                                <div class="response" id="mce-error-response2" style="display:none"></div>
                                                <div class="response" id="mce-success-response2" style="display:none"></div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <div class="progress-wrap"><svg class="progress-circle svg-content" width="100%" height="100%"
                viewbox="-1 -1 102 102">
                <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
            </svg></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js"
            integrity="sha512-pax4MlgXjHEPfCwcJLQhigY7+N8rt6bVvWLFyUMuxShv170X53TRzGPmPkZmGBhk+jikR8WBM4yl7A9WMHHqvg=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
            integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
            crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"
            integrity="sha512-37T7leoNS06R80c8Ulq7cdCDU5MNQBwlYoy1TX/WUsLFC2eYNqtKlV0QjH7r8JpG/S0GUMZwebnVFLPd6SU5yg=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js"
            integrity="sha512-XZEy8UQ9rngkxQVugAdOuBRDmJ5N4vCuNXCh8KlniZgDKTvf7zl75QBtaVG1lEhMFe2a2DuA22nZYY+qsI2/xA=="
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script
        <script defer="defer" src="/js/plugins.js"></script>
        <script defer="defer" src="/js/theme.js"></script>
        <script defer="defer" src="/js/validatePassword.js"></script>
        <script defer="defer" src="/js/callAPI.js"></script>
        <script defer="defer" src="/js/api.js"></script>
        <script defer="defer" src="/js/hoverArticles.js"></script>
    </body>

    </html>
  `;
        //  generate html into ucademy-corporate-site/src/blog
        const htmldistblog = `
  <!doctype html>
  <html lang="en">

  <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="robots" content="index,follow">
      <meta name="copyright" content="Ucademy">
      <meta name="description" content="Cập nhật nhanh chóng các bài viết và tin tức mới nhất từ Ucademy!">
      <meta name="detail" content="Nền tảng học trực tuyến">
      <meta name="keywords"
          content="ucademy, learning, corporate, lms, online, marketing, saas, paas, training, startup, ucademy.vn">
      <meta name="author" content="Ucademy">
      <meta name="og:site_name" content="Ucademy">
      <meta property="og:title" content="${blog.metaBlog}">
      <meta property="og:url" content-t="${blog.urlBlog}.html">
      <meta property="og:description"
          content="${blog.introduce}">
      <meta property="og:type" content="website">
      <meta property="og:image" content="${blog.imageUrl}">
      <meta property="og:image:alt" content="Nền tảng học trực tuyến">
      <title>${blog.titleBlog}</title>
      <link rel="shortcut icon" type="image/x-icon" href="/img/e12163.png">
      <link rel="stylesheet" href="../../css/plugins.css">
      <link rel="stylesheet" href="../../css/style.css">
      <link rel="stylesheet" href="../../css/colors/grape.css">
      <link rel="stylesheet" href="../../css/colors/black.css">
      <link rel="preload" as="style" href="../../css/fonts/avenirNext.css" onload="this.rel='stylesheet'">
      <link href="/css/plugins.css" rel="stylesheet">
      <link href="/css/style.css" rel="stylesheet">
      <link href="/css/colors/black.css" rel="stylesheet">
      <link href="/css/colors/grape.css" rel="stylesheet">
      <link href="/css/fonts/avenirNext.css" rel="stylesheet">
  </head>

  <body>
      <div class="content-wrapper">
          <header class="wrapper">
              <nav class="navbar navbar-expand-lg center-nav transparent navbar-light">
                  <div class="container flex-lg-row flex-nowrap align-items-center">
                      <div class="navbar-brand w-100"><a href="/index.html"><img src="/img/64fc46.png"
                                  srcset="/img/431cd4.png 2x" alt></a></div>
                      <div class="navbar-collapse offcanvas-nav">
                          <div class="offcanvas-header d-lg-none d-xl-none"><a href="/index.html"><img
                                      src="/img/92e42d.png" srcset="/img/f67702.png 2x" alt></a><button type="button"
                                  class="btn-close btn-close-white offcanvas-close offcanvas-nav-close"
                                  aria-label="Close"></button></div>
                          <ul class="navbar-nav">
                              <li class="nav-item dropdown"><a class="nav-link" href="/index.html">Trang chủ</a></li>
                              <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#!">Sản phẩm</a>
                                  <ul class="dropdown-menu">
                                      <li class="nav-item"><a class="dropdown-item" href="/product_overview.html">Tổng
                                              quan sản phẩm</a></li>
                                      <li class="nav-item"><a class="dropdown-item" href="/product_features.html">Tính
                                              năng sản phẩm</a></li>
                                  </ul>
                              </li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/pricing.html">Bảng giá</a></li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/contact.html">Liên hệ</a></li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/blog.html">Blog</a></li>
                          </ul>
                      </div>
                      <div class="navbar-other w-100 d-flex ms-auto">
                          <ul class="navbar-nav flex-row align-items-center ms-auto" data-sm-skip="true">
                              <li class="nav-item dropdown language-select text-uppercase"><a
                                      class="nav-link dropdown-item dropdown-toggle btn-lang-set" href="#" role="button"
                                      data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">En</a>
                                  <ul class="dropdown-menu">
                                      <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                              data-select="en"
                                              href="/en/blog/${relatedBlogInfo.urlBlog}.html">En</a></li>
                                      <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                              data-select="vn"
                                              href="/blog/${blog.urlBlog}.html">Vn</a>
                                      </li>
                                  </ul>
                              </li>
                              <li class="nav-item d-none d-md-block"><a class="btn btn-sm btn-primary rounded-pill"
                                      href="/register.html">Dùng thử miễn phí!</a></li>
                              <li class="nav-item d-lg-none">
                                  <div class="navbar-hamburger"><button type="button" name="btn-nav"
                                          class="hamburger animate plain"
                                          data-toggle="offcanvas-nav"><span></span></button></div>
                              </li>
                          </ul>
                      </div>
                  </div>
              </nav>
          </header>
      </div>
      <section class="wrapper bg-soft-primary angled upper-end lower-start">
          <div class="container py-5 py-md-15 text-center">
              <div class="row">
                  <div class="col-md-7 col-lg-6 col-xl-6 mx-auto">
                      <h1 class="blog-back display-2 mb-3">Blog News</h1>
                      <p class="px-lg-2 px-xxl-8 mb-0 lead-blog">Cập nhật các bài viết và tin tức mới nhất từ Ucademy!</p>
                  </div>
              </div>
          </div>
      </section>
      <section class="wrapper bg-light">
          <div class="container py-14 py-md-6">
              <div class="blog">
                  <article class="post">
                      <div class="card">
                          <div class="overlay-box"><img class="ms-xl-5" src="${blog.imageUrl}"
                                  style="width:70%;object-fit:contain;vertical-align:text-to" alt></div>
                          <div class="card-body">
                              <div class="post-header">
                                  <h2 class="post-title mt-1 mb-0">${blog.title}</h2>
                              </div>
                              <div class="col-md-12">
                                  <ul class="post-meta mb-0 blog-i-fas">
                                      <li class="post-date blog-i-fas"><i class="uil uil-user"></i><span>${blog.author}</span>
                                      </li>
                                      <li class="post-author blog-i-fas"><i class="uil uil-calendar-alt"></i><span>
                                              ${formattedDate}</span></li>
                                      <li class="post-comments blog-i-fas"><i class="uil uil-eye"></i><span>${blog.view}</span>
                                      </li>
                                  </ul>
                              </div>
                              <p class="card-text blog-text"><span>${categories}</span></p>
                              <div class="post-content">
                                  <p class="blog-back" data-t>${blog.description}</p>
                              </div>
                          </div>
                      </div>
                  </article>
              </div>
          </div>
      </section>
      <section class="wrapper bg-light mb-12">
          <div class="container py-1 pt-md-1 pb-md-1">
              <div class="row align-items-center mb-5">
                  <div class="col-md-8 col-lg-3 col-xl-8 col-xxl-7 pe-xl-20">
                      <h3 class="display-7 mb-0">Bài viết liên quan</h3>
                  </div>
                  <div class="col-md-4 col-lg-3 ms-md-auto text-md-end mt-5 mt-md-0"><a
                          class="rounded-pill mb-0 blog-all-text" href="/blog.html">Xem tất cả</a></div>
                  <article class="post">
                      <div class="card">
                          <div class="post-slider card-img-top">
                              <div class="swiper-container dots-over" data-margin="5" data-nav="true" data-dots="true">
                                  <div class="swiper"></div>
                              </div>
                          </div>
                      </div>
                  </article>
              </div>
              <div class="blog-card mb-1" id="hover-blog-2"><a class="blog-back"
                      href="/blog/10-meo-de-tao-mot-video-giang-day-hap-dan.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">10 mẹo để tạo một video giảng dạy hấp dẫn
                                  </h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-2"><a class="blog-back"
                          href="/blog/10-meo-de-tao-mot-video-giang-day-hap-dan.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">10 mẹo để tạo một video giảng dạy
                                          hấp dẫn</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Đèn. Máy quay. Diễn! Chào mừng
                                      bạn đến với thế giới làm phim giáo dục kiểu điện ảnh, nơi sáng tạo giao thoa với
                                      công nghệ để tạo ra các video giáo dục hiệu quả và hấp dẫn. Tạo ra một video giáo
                                      dục mà thu hút sự chú ý của khán giả và truyền đạt thông điệp của bạn hiệu quả đòi
                                      hỏi sự kết hợp của sáng tạo, kỹ năng kỹ thuật và sự hiểu biết về khán giả của bạn.
                                  </p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-3"><a class="blog-back"
                      href="/blog/cach-xay-dung-mot-chuong-trinh-dao-tao-khach-hang-thanh-cong.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">Cách xây dựng một chương trình đào tạo
                                      khách hàng thành công</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-3"><a class="blog-back"
                          href="/blog/cach-xay-dung-mot-chuong-trinh-dao-tao-khach-hang-thanh-cong.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">Cách xây dựng một chương trình đào
                                          tạo khách hàng thành công</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Nghiệp vụ đào tạo khách hàng phát
                                      triển nhanh hơn từ khi doanh nghiệp nhận ra tầm quan trọng của việc cung cấp trải
                                      nghiệm khách hàng tuyệt vời. Khi các doanh nghiệp cố gắng tạo sự khác biệt so với
                                      đối thủ cạnh tranh, họ nhận ra rằng cung cấp dịch vụ khách hàng xuất sắc là chìa
                                      khóa để xây dựng mối quan hệ lâu dài với khách hàng.</p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-4"><a class="blog-back"
                      href="/blog/chien-luoc-gia-cho-cac-khoa-hoc-truc-tuyen.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">Chiến lược giá cho các khóa học
                                      trực tuyến</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-4"><a class="blog-back"
                          href="/blog/chien-luoc-gia-cho-cac-khoa-hoc-truc-tuyen.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">Chiến lược giá cho các
                                          khóa học trực tuyến</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Trong những năm gần đây, dạy học
                                      trực tuyến đã trở nên ngày càng phổ biến, đặc biệt là với sự xuất hiện của các nền
                                      tảng học trực tuyến. Việc định giá cho khóa học trực tuyến của bạn là một trong
                                      những quyết định quan trọng nhất mà bạn sẽ đưa ra trong quá trình tạo khóa học của
                                      mình.</p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-5"><a class="blog-back"
                      href="/blog/vi-sao-nhan-vien-khong-muon-tham-gia-chuong-trinh-dao-tao-cua-ban.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">Vì sao nhân viên không muốn tham gia
                                      chương trình đào tạo của bạn</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-5"><a class="blog-back"
                          href="/blog/vi-sao-nhan-vien-khong-muon-tham-gia-chuong-trinh-dao-tao-cua-ban.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">Vì sao nhân viên không muốn
                                          tham gia chương trình đào tạo của bạn</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Sự tham gia của nhân viên vào các
                                      chương trình đào tạo là rất quan trọng cho sự thành công của bất kỳ tổ chức, doanh
                                      nghiệp nào. Ví dụ như Microsoft, ngoài dẫn đầu thị trường ở mảng các sản phẩm và
                                      dịch vụ đột phá, thành công của họ còn được ghi nhận ở mảng đào tạo nhân viên.</p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-text-all"><a class="rounded-pill mb-0 blog-all-text" href="/blog.html">Xem tất cả</a>
              </div>
          </div>
      </section>
      <footer class="bg-light">
          <div class="container-card">
              <div class="card image-wrapper bg-full bg-image bg-overlay bg-overlay-light-500 mb-14 bg-image-home-bg22"
                  data-image-src=".././assets/img/photos/bg22.png">
                  <div class="card-body py-14 px-0">
                      <div class="container">
                          <div class="row text-center">
                              <div class="col-xl-11 col-xxl-9 mx-auto">
                                  <h2 class="fs-16 text-uppercase text-gradient gradient-1 mb-3">Tham gia cộng đồng của
                                      chúng tôi</h2>
                                  <h3 class="display-4 mb-7 px-lg-17">Chúng tôi đã và đang xây dựng hơn 1000 trường học và
                                      trung tâm đào tạo trực tuyến. Tham gia với chúng tôi ngay bây giờ và phát triển
                                      doanh nghiệp của bạn.</h3>
                              </div>
                          </div>
                          <div class="d-flex justify-content-center"><span><a
                                      class="btn btn-lg btn-gradient gradient-1 rounded" href="/register.html">Dùng thử
                                      miễn phí</a></span></div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="container pb-13 pb-md-15">
              <div class="row gy-6 gy-lg-0">
                  <div class="col-md-4 col-lg-3">
                      <div class="widget"><img class="mb-4" src="/img/64fc46.png" srcset="/img/431cd4.png 2x" alt>
                          <p class="mb-4"><span id="year-copyright"></span> Dicom Interactive. <br
                                  class="d-none d-lg-block"> Chịu trách nhiệm sản phẩm và nội dung.</p>
                          <nav class="nav social"><a href="https://www.linkedin.com/company/dicom-interactive/"><i
                                      class="uil uil-linkedin"></i></a> <a
                                  href="https://www.facebook.com/dicominteractive"><i class="uil uil-facebook-f"></i></a>
                          </nav>
                      </div>
                  </div>
                  <div class="col-md-4 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Thông tin liên hệ</h4>
                          <address class="pe-xl-15 pe-xxl-17">81 Cách Mạng Tháng 8, Phường Bến Thành, Quận 1, Thành phố Hồ
                              Chí Minh, Việt Nam.</address><a href="mailto:hello@ucademy.vn"
                              class="link-body">hello@ucademy.vn</a><br>
                          <div class="flag-number-phone"><img src="/img/82de73.png" alt="Australia"> <span
                                  style="margin-bottom:0">(+61) 390 1878 86</span></div>
                          <div class="flag-number-phone"><img src="/img/231f3c.png" alt="Viet Nam"> <span
                                  style="margin-bottom:0">(+84) 287 1065 144</span></div>
                      </div>
                  </div>
                  <div class="col-md-4 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Tìm hiểu thêm</h4>
                          <ul class="list-unstyled text-reset mb-0">
                              <li><a href="/index.html">Trang chủ</a></li>
                              <li><a href="/product_overview.html">Tổng quan sản phẩm</a></li>
                              <li><a href="/product_features.html">Tính năng sản phẩm</a></li>
                              <li><a href="/pricing.html">Bảng giá</a></li>
                              <li><a href="/contact.html">Liên hệ</a></li>
                              <li><a href="/blog.html">Blog</a></li>
                          </ul>
                      </div>
                  </div>
                  <div class="col-md-12 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Bản tin</h4>
                          <p class="mb-5">Đăng ký bảng tin để nhận thông tin cập nhật mới nhất và sớm nhất về sản phẩm,
                              chương trình khuyến mãi.</p>
                          <div class="newsletter-wrapper">
                              <div id="mc_embed_signup2">
                                  <form action="https://api.ucademy.vn/newsletter" method="post"
                                      id="mc-embedded-subscribe-form2" name="mc-embedded-subscribe-form" class="validate"
                                      novalidate>
                                      <div class="messages-email"></div>
                                      <div id="mc_embed_signup_scroll2">
                                          <div class="mc-field-group input-group form-floating"><input type="email"
                                                  name="EMAIL" class="form-control" id="mce-EMAIL2" required
                                                  placeholder="Email của bạn"> <label for="mce-EMAIL2">Email của
                                                  bạn</label> <input type="submit" name="subscribe"
                                                  id="mc-embedded-subscribe2"
                                                  class="btn btn-primary btn-gradient gradient-1" value="Đăng ký"></div>
                                          <div id="mce-responses2" class="clear">
                                              <div class="response" id="mce-error-response2" style="display:none"></div>
                                              <div class="response" id="mce-success-response2" style="display:none"></div>
                                          </div>
                                      </div>
                                  </form>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
      <div class="progress-wrap"><svg class="progress-circle svg-content" width="100%" height="100%"
              viewbox="-1 -1 102 102">
              <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js"
          integrity="sha512-pax4MlgXjHEPfCwcJLQhigY7+N8rt6bVvWLFyUMuxShv170X53TRzGPmPkZmGBhk+jikR8WBM4yl7A9WMHHqvg=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
          integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
          crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"
          integrity="sha512-37T7leoNS06R80c8Ulq7cdCDU5MNQBwlYoy1TX/WUsLFC2eYNqtKlV0QjH7r8JpG/S0GUMZwebnVFLPd6SU5yg=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js"
          integrity="sha512-XZEy8UQ9rngkxQVugAdOuBRDmJ5N4vCuNXCh8KlniZgDKTvf7zl75QBtaVG1lEhMFe2a2DuA22nZYY+qsI2/xA=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script
      <script defer="defer" src="/js/plugins.js"></script>
      <script defer="defer" src="/js/theme.js"></script>
      <script defer="defer" src="/js/validatePassword.js"></script>
      <script defer="defer" src="/js/callAPI.js"></script>
      <script defer="defer" src="/js/api.js"></script>
      <script defer="defer" src="/js/hoverArticles.js"></script>
  </body>

  </html>
  `;
        // generate html into ucademy-corporate-site/dist/blog
        const htmlblogviewdist = `
  <!doctype html>
  <html lang="en">

  <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="robots" content="index,follow">
      <meta name="copyright" content="Ucademy">
      <meta name="description" content="${relatedBlogInfo.metaBlog}">
      <meta name="detail" content="e-Learning platform">
      <meta name="keywords"
          content="ucademy, learning, corporate, lms, online, marketing, saas, paas, training, startup, ucademy.vn">
      <meta name="author" content="Ucademy">
      <meta name="og:site_name" content="Ucademy">
      <meta property="og:title" content="${relatedBlogInfo.metaBlog}">
      <meta property="og:url" content-t="${relatedBlogInfo.urlBlog}.html">
      <meta property="og:description"
          content="${relatedBlogInfo.introduce}">
      <meta property="og:type" content="website">
      <meta property="og:image"
          content="${relatedBlogInfo.imageUrl}">
      <meta property="og:image:alt" content="e-Learning platform">
      <title>${relatedBlogInfo.urlBlog}</title>
      <link rel="shortcut icon" type="image/x-icon" href="/img/e12163.png">
      <link rel="stylesheet" href="../../css/plugins.css">
      <link rel="stylesheet" href="../../css/style.css">
      <link rel="stylesheet" href="../../css/colors/grape.css">
      <link rel="stylesheet" href="../../css/colors/black.css">
      <link rel="preload" as="style" href="../../css/fonts/avenirNext.css" onload="this.rel='stylesheet'">
      <link href="/css/plugins.css" rel="stylesheet">
      <link href="/css/style.css" rel="stylesheet">
      <link href="/css/colors/black.css" rel="stylesheet">
      <link href="/css/colors/grape.css" rel="stylesheet">
      <link href="/css/fonts/avenirNext.css" rel="stylesheet">
  </head>
  <body>
      <div class="content-wrapper">
          <header class="wrapper">
              <nav class="navbar navbar-expand-lg center-nav transparent navbar-light">
                  <div class="container flex-lg-row flex-nowrap align-items-center">
                      <div class="navbar-brand w-100"><a href="/index.html"><img src="/img/64fc46.png"
                                  srcset="/img/431cd4.png 2x" alt></a></div>
                      <div class="navbar-collapse offcanvas-nav">
                          <div class="offcanvas-header d-lg-none d-xl-none"><a href="/index.html"><img
                                      src="/img/92e42d.png" srcset="/img/f67702.png 2x" alt></a><button type="button"
                                  class="btn-close btn-close-white offcanvas-close offcanvas-nav-close"
                                  aria-label="Close"></button></div>
                          <ul class="navbar-nav">
                              <li class="nav-item dropdown"><a class="nav-link" href="/index.html">Home</a></li>
                              <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#!">Product</a>
                                  <ul class="dropdown-menu">
                                      <li class="nav-item"><a class="dropdown-item"
                                              href="/product_overview.html">Overview</a></li>
                                      <li class="nav-item"><a class="dropdown-item"
                                              href="/product_features.html">Features</a></li>
                                  </ul>
                              </li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/pricing.html">Pricing</a></li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/contact.html">Contact Us</a></li>
                              <li class="nav-item dropdown"><a class="nav-link" href="/blog.html">Blog</a></li>
                          </ul>
                      </div>
                      <div class="navbar-other w-100 d-flex ms-auto">
                          <ul class="navbar-nav flex-row align-items-center ms-auto" data-sm-skip="true">
                              <li class="nav-item dropdown language-select text-uppercase"><a
                                      class="nav-link dropdown-item dropdown-toggle btn-lang-set" href="#" role="button"
                                      data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">En</a>
                                  <ul class="dropdown-menu">
                                      <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                              data-select="en"
                                              href="/en/blog/${relatedBlogInfo.urlBlog}.html">En</a>
                                      </li>
                                      <li class="nav-item"><a style="width:100%" class="dropdown-item btn-lang"
                                              data-select="vn"
                                              href="/blog/${blog.urlBlog}.html">Vn</a>
                                      </li>
                                  </ul>
                              </li>
                              <li class="nav-item d-none d-md-block"><a class="btn btn-sm btn-primary rounded-pill"
                                      href="/register.html">Try it free!</a></li>
                              <li class="nav-item d-lg-none">
                                  <div class="navbar-hamburger"><button type="button" name="btn-nav"
                                          class="hamburger animate plain"
                                          data-toggle="offcanvas-nav"><span></span></button></div>
                              </li>
                          </ul>
                      </div>
                  </div>
              </nav>
          </header>
      </div>
      <section class="wrapper bg-soft-primary angled upper-end lower-start">
          <div class="container py-5 py-md-15 text-center">
              <div class="row">
                  <div class="col-md-7 col-lg-6 col-xl-6 mx-auto">
                      <h1 class="blog-back display-2 mb-3">Blog News</h1>
                      <p class="px-lg-2 px-xxl-8 mb-0 lead-blog">Welcome to our journal.<br>Here you can find the latest
                          company news.</p>
                  </div>
              </div>
          </div>
      </section>
      <section class="wrapper bg-light">
          <div class="container py-14 py-md-6">
              <div class="blog">
                  <article class="post">
                      <div class="card">
                          <div class="overlay-box"><img class="ms-xl-5"
                                  src=${relatedBlogInfo.imageUrl}
                                  style="width:70%;object-fit:contain;vertical-align:text-to" alt></div>
                          <div class="card-body">
                              <div class="post-header">
                                  <h2 class="post-title mt-1 mb-0">${relatedBlogInfo.title}</h2>
                              </div>
                              <div class="col-md-12">
                                  <ul class="post-meta mb-0 blog-i-fas">
                                      <li class="post-date blog-i-fas"><i class="uil uil-user"></i><span>${relatedBlogInfo.author}</span></li>
                                      <li class="post-author blog-i-fas"><i class="uil uil-calendar-alt"></i><span>${timesformattedDate}</span></li>
                                      <li class="post-comments blog-i-fas"><i class="uil uil-eye"></i><span>${relatedBlogInfo.view}</span>
                                      </li>
                                  </ul>
                              </div>
                              <p class="card-text blog-text"><span>${categoriesBlog}</span></p>
                              <div class="post-content">
                                  <p class="blog-back" data-t>${relatedBlogInfo.description}</p>
                              </div>
                          </div>
                      </div>
                  </article>
              </div>
          </div>
      </section>
      <section class="wrapper bg-light mb-12">
          <div class="container py-1 pt-md-1 pb-md-1">
              <div class="row align-items-center mb-5">
                  <div class="col-md-8 col-lg-3 col-xl-8 col-xxl-7 pe-xl-20">
                      <h3 class="display-7 mb-0">Related Articles</h3>
                  </div>
                  <div class="col-md-4 col-lg-3 ms-md-auto text-md-end mt-5 mt-md-0"><a
                          class="rounded-pill mb-0 blog-all-text" href="/en/blog.html">All articles</a></div>
                  <article class="post">
                      <div class="card">
                          <div class="post-slider card-img-top">
                              <div class="swiper-container dots-over" data-margin="5" data-nav="true" data-dots="true">
                                  <div class="swiper"></div>
                              </div>
                          </div>
                      </div>
                  </article>
              </div>
              <div class="blog-card mb-1" id="hover-blog-2"><a class="blog-back"
                      href="/en/blog/10-tips-for-creating-an-engaging-teaching-video.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">10 tips for creating an engaging teaching
                                      video</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-2"><a class="blog-back"
                          href="/en/blog/10-tips-for-creating-an-engaging-teaching-video.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">10 tips for creating an engaging
                                          teaching video</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Lights. Camera. Action! Welcome
                                      to the world of cinematic education, where creativity meets technology to create
                                      powerful and engaging educational videos. Creating an educational video that
                                      captures the attention of your audience and delivers your message effectively
                                      requires a combination of creativity, technical skills, and an understanding of your
                                      audience.</p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-3"><a class="blog-back"
                      href="/en/blog/how-to-build-a-successful-customer-training-program.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">How to build a successful customer training
                                      program</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-3"><a class="blog-back"
                          href="/en/blog/how-to-build-a-successful-customer-training-program.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">How to build a successful customer
                                          training program</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">The evolution of customer
                                      training has been driven by the importance of providing a superior customer
                                      experience. As businesses strive to differentiate themselves from their competitors,
                                      they have realized that providing exceptional customer service is key to building
                                      long-lasting relationships with their customers. </p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-4"><a class="blog-back"
                      href="/en/blog/how-to-determine-the-price-of-your-online-courses.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">How to Determine the Price of Your Online
                                      Courses</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-4"><a class="blog-back"
                          href="/en/blog/how-to-determine-the-price-of-your-online-courses.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">How to Determine the Price of Your
                                          Online Courses</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">In recent years, online courses
                                      have become increasingly popular, especially with the emergence of e-learning
                                      platforms. Pricing your online course is one of the most critical decisions you will
                                      make in your course creation process.</p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-card mb-1" id="hover-blog-5"><a class="blog-back"
                      href="/en/blog/why-employees-do-not-engage-with-your-training-programs.html">
                      <div class="card-body p-2 pb-0">
                          <div class="row">
                              <div class="post-header mb-1">
                                  <h4 class="post-title-blog mb-0 blog-backen">Why employees do not engage with your
                                      training programs</h4>
                                  <div class="card">
                                      <div class="swiper-container dots-over" data-margin="5" data-nav="true"
                                          data-dots="true"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="hover-blog" id="hovered-blog-5"><a class="blog-back"
                          href="/en/blog/why-employees-do-not-engage-with-your-training-programs.html">
                          <div class="card-body p-2 pb-0 container">
                              <div class="row">
                                  <div class="post-header mb-1">
                                      <h4 class="post-title-blog mb-1 hover-blog-title">Why employees do not engage with
                                          your training programs</h4>
                                  </div>
                                  <p class="card-text blob-text pb-md-0 hover-blog_test">Engaging employees in training
                                      programs is crucial to the success of any organization. Like Microsoft, beside its
                                      leading innovative products and services, the company’s success is largely
                                      attributed to its employee engagement and training programs. </p>
                              </div>
                          </div>
                      </a></div>
              </div>
              <div class="blog-text-all"><a class="rounded-pill mb-0 blog-all-text" href="/en/blog.html">All articles</a>
              </div>
          </div>
      </section>
      <footer class="bg-light">
          <div class="container-card">
              <div class="card image-wrapper bg-full bg-image bg-overlay bg-overlay-light-500 mb-14 bg-image-home-bg22"
                  data-image-src=".././assets/img/photos/bg22.png">
                  <div class="card-body py-14 px-0">
                      <div class="container">
                          <div class="row text-center">
                              <div class="col-xl-11 col-xxl-9 mx-auto">
                                  <h2 class="fs-16 text-uppercase text-gradient gradient-1 mb-3">Join Our Community</h2>
                                  <h3 class="display-4 mb-7 px-lg-17">We are building over 1000+ online schools and
                                      training centers. Join them now and grow your business.</h3>
                              </div>
                          </div>
                          <div class="d-flex justify-content-center"><span><a
                                      class="btn btn-lg btn-gradient gradient-1 rounded" href="/register.html">Try it
                                      free!</a></span></div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="container pb-13 pb-md-15">
              <div class="row gy-6 gy-lg-0">
                  <div class="col-md-4 col-lg-3">
                      <div class="widget"><img class="mb-4" src="/img/64fc46.png" srcset="/img/431cd4.png 2x" alt>
                          <p class="mb-4"><span id="year-copyright"></span> Dicom Interactive. <br
                                  class="d-none d-lg-block"> All rights reserved.</p>
                          <nav class="nav social"><a href="https://www.linkedin.com/company/dicom-interactive/"><i
                                      class="uil uil-linkedin"></i></a> <a
                                  href="https://www.facebook.com/dicominteractive"><i class="uil uil-facebook-f"></i></a>
                          </nav>
                      </div>
                  </div>
                  <div class="col-md-4 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Get In Touch</h4>
                          <address class="pe-xl-15 pe-xxl-17">81 Cach Mang Thang Tam, Ben Thanh ward, District 1, HCMC,
                              Vietnam.</address><a href="mailto:hello@ucademy.vn"
                              class="link-body">hello@ucademy.vn</a><br>
                          <div class="flag-number-phone"><img src="/img/82de73.png" alt="Australia"> <span
                                  style="margin-bottom:0">(+61) 390 1878 86</span></div>
                          <div class="flag-number-phone"><img src="/img/231f3c.png" alt="Viet Nam"> <span
                                  style="margin-bottom:0">(+84) 287 1065 144</span></div>
                      </div>
                  </div>
                  <div class="col-md-4 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Learn More</h4>
                          <ul class="list-unstyled text-reset mb-0">
                              <li><a href="/index.html">Home</a></li>
                              <li><a href="/product_overview.html">Product Overview</a></li>
                              <li><a href="/product_features.html">Product Features</a></li>
                              <li><a href="/pricing.html">Pricing</a></li>
                              <li><a href="/contact.html">Contact Us</a></li>
                              <li><a href="/blog.html">Blog</a></li>
                          </ul>
                      </div>
                  </div>
                  <div class="col-md-12 col-lg-3">
                      <div class="widget">
                          <h4 class="widget-title mb-3">Our Newsletter</h4>
                          <p class="mb-5">Subscribe to our newsletter to get our news & deals delivered to you.</p>
                          <div class="newsletter-wrapper">
                              <div id="mc_embed_signup2">
                                  <form action="https://api.ucademy.vn/newsletter" method="post"
                                      id="mc-embedded-subscribe-form2" name="mc-embedded-subscribe-form" class="validate"
                                      novalidate>
                                      <div class="messages-email"></div>
                                      <div id="mc_embed_signup_scroll2">
                                          <div class="mc-field-group input-group form-floating"><input type="email"
                                                  name="EMAIL" class="form-control" id="mce-EMAIL2" required
                                                  placeholder="Email Address"> <label for="mce-EMAIL2">Email
                                                  Address</label> <input type="submit" name="subscribe"
                                                  id="mc-embedded-subscribe2"
                                                  class="btn btn-primary btn-gradient gradient-1" value="Join"></div>
                                          <div id="mce-responses2" class="clear">
                                              <div class="response" id="mce-error-response2" style="display:none"></div>
                                              <div class="response" id="mce-success-response2" style="display:none"></div>
                                          </div>
                                      </div>
                                  </form>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
      <div class="progress-wrap"><svg class="progress-circle svg-content" width="100%" height="100%"
              viewbox="-1 -1 102 102">
              <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
          </svg></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js"
          integrity="sha512-pax4MlgXjHEPfCwcJLQhigY7+N8rt6bVvWLFyUMuxShv170X53TRzGPmPkZmGBhk+jikR8WBM4yl7A9WMHHqvg=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
          integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
          crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"
          integrity="sha512-37T7leoNS06R80c8Ulq7cdCDU5MNQBwlYoy1TX/WUsLFC2eYNqtKlV0QjH7r8JpG/S0GUMZwebnVFLPd6SU5yg=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js"
          integrity="sha512-XZEy8UQ9rngkxQVugAdOuBRDmJ5N4vCuNXCh8KlniZgDKTvf7zl75QBtaVG1lEhMFe2a2DuA22nZYY+qsI2/xA=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script defer="defer" src="/js/babel.b73e066996862e570dd6.js"></script>
      <script defer="defer" src="/js/plugins.js"></script>
      <script defer="defer" src="/js/theme.js"></script>
      <script defer="defer" src="/js/validatePassword.js"></script>
      <script defer="defer" src="/js/callAPI.js"></script>
      <script defer="defer" src="/js/api.js"></script>
      <script defer="defer" src="/js/hoverArticles.js"></script>
  </body>
  </html>
    `;
        // Check if blog is EN or VN and create file
        if (blog.language === 'en') {
            const fileNameEn = `${blog.urlBlog}.html`;
            const fileNameVn = `${relatedBlogInfo.urlBlog}.html`;
        
            filesVnExistInS3(fileNameEn, fileNameVn)
                .then(async ({ existsEn, existsVn }) => {
                    if (existsEn) {
                        // If English file exists, invalidate and delete
                        await invalidateAndVnDelete(fileNameEn);
                    }
        
                    if (existsVn) {
                        // If Vietnamese file exists, invalidate and delete
                        await invalidateAndVnDeleteVn(fileNameVn);
                    }
        
                    // Create new files
                    try {
                        const [fileHtmlEn, fileHtmlVn] = await Promise.all([
                            createVnFileHtmlEn(req.file, fileNameEn, htmldist),
                            createVnFileHtmlVn(req.file, fileNameVn, htmlvn)
                        ]);
                        
                        res.status(200).json({
                            message: "Files uploaded successfully.",
                            fileNamehtmlEn: fileHtmlEn,
                            fileNamehtmlVn: fileHtmlVn,
                        });
                    } catch (error) {
                        res.status(500).json({ error: error });
                    }
                })
                .catch(error => {
                    res.status(500).json({ error: error.message });
                });
        }
        // capture data more folders when changing language to Vietnames
        if (blog.language === 'vn') {
            const fileNameVn = `${blog.urlBlog}.html`;
            const fileNameEn = `${relatedBlogInfo.urlBlog}.html`;
        
            filesVnExistInS3(fileNameEn, fileNameVn)
                .then(async ({ existsEn, existsVn }) => {
                    if (existsEn) {
                        // If English file exists, invalidate and delete
                        await invalidateAndVnDelete(fileNameEn);
                    }
                    if (existsVn) {
                        // If Vietnamese file exists, invalidate and delete
                        await invalidateAndVnDeleteVn(fileNameVn);
                    }
        
                    // Create new files
                    try {
                        const [fileHtmlEn, fileHtmlVn] = await Promise.all([
                            createVnFileHtmlBlogen(req.file, fileNameEn, htmlblogviewdist),
                            createVnFileHtmlBlogvn(req.file, fileNameVn, htmldistblog)
                        ]);
                        
                        res.status(200).json({
                            message: "Files uploaded successfully.",
                            fileNamehtmlEn: fileHtmlEn,
                            fileNamehtmlVn: fileHtmlVn,
                        });
                    } catch (error) {
                        res.status(500).json({ error: error });
                    }
                })
                .catch(error => {
                    res.status(500).json({ error: error.message });
                });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}


module.exports = {
    getVnBlog,
};