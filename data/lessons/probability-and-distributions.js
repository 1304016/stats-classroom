/* Lessons for the category "Probability and distributions". */
window.LESSONS=window.LESSONS||{};
Object.assign(window.LESSONS,{
"normal-distribution":{
  def:"Normal distribution হলো ঘণ্টার মতো আকারের সেই curve। বেশিরভাগ মান মাঝখানের কাছাকাছি থাকে, আর দুই দিকে যত দূরে যান, মান তত কম পাওয়া যায়।",
  example:[
    "ধরুন আপনি একটা বিশ্ববিদ্যালয়ের সব ছাত্রছাত্রীর উচ্চতা মাপলেন। বেশিরভাগের উচ্চতা গড়ের কাছাকাছি। খুব লম্বা বা খুব বেঁটে, দুটোই কম। কোন উচ্চতা কতজনের আছে সেটা এঁকে ফেললে একটা ঘণ্টার আকার পাবেন, যার বাঁ আর ডান দিক প্রায় একরকম।",
    "নিচের demo-তে গড় আর ছড়ানো change করে দেখুন, curve-টা কেমন হয়।"],
  remember:"তবে মনে রাখতে হবে, একটা normal curve পুরোপুরি ঠিক হয়ে যায় শুধু দুটো সংখ্যা দিয়ে, mean আর standard deviation। যেকোনো normal curve-এ প্রায় 68 শতাংশ মান mean থেকে এক standard deviation-এর মধ্যে থাকে, প্রায় 95 শতাংশ দুইয়ের মধ্যে, আর প্রায় 99.7 শতাংশ তিনের মধ্যে। অনেক statistical test ধরে নেয় ডেটা মোটামুটি normal।",
  demo:{id:"bell",ui:{
    meanLabel:"গড় উচ্চতা",meanValue:"{v} cm",sdLabel:"ছড়ানো, মানে standard deviation",sdValue:"{v} cm",
    presets:[[1,"1 SD-র মধ্যে"],[2,"2 SD-র মধ্যে"],[3,"3 SD-র মধ্যে"]],
    pctLabel:"ছায়া দেওয়া অংশে থাকা ছাত্রছাত্রী",rangeLabel:"ছায়া দেওয়া range",rangeValue:"{lo} থেকে {hi} cm",
    meanMark:"গড় {v} cm",xTitle:"উচ্চতা (cm)",
    aria:"ছাত্রছাত্রীদের উচ্চতার bell curve",
    tails:{1:"বাকি প্রায় 32 শতাংশ এর বাইরে।",2:"বাকি মাত্র প্রায় 5 শতাংশ এর বাইরে।",3:"এর বাইরে প্রায় কেউই নেই।"},
    msg:"প্রায় {p} শতাংশ ছাত্রছাত্রীর উচ্চতা {lo} cm থেকে {hi} cm-এর মধ্যে। {tail} ছড়ানো change করে দেখুন, bell কেমন চওড়া বা সরু হয়।"}}}
});
