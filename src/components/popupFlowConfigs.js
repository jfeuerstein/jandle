// Example popup flow configurations

export const anniversaryFlow2026 = {
  flowId: '6m-anniversary-2026',
  showAfter: '2026-01-01T00:00:00',
  showBefore: '2026-01-02T23:59:59',
  pages: [
    {
      title: 'happy 6 months nins :)',
      message: `to say the last six months will be some of the most memorable, love-filled, deeply cherished months in my lifetime would possibly be the understatement of the year.\n
and last year. since this one just started.\n
serionsly though, it's hard to put into words just how much you've grown to mean to me. It's seriously hard to wrap my head around how casually I viewed meeting you, and how perfectly everything's gone since.\n
we really are a perfect romcom couple, and i really do feel like the luckiest son of a bitch to get to live it.`,
      nextText: '[ happy 6! ]'
    },
    {
      title: 'what a special day',
      message: `today is much more special than an anniverssary to me. somehow, with a little luck and coincidence, we've hit some real cool milestones right as the year is turning.\n
we're finishing up shows and movies, we're getting to year 2 in stardew, we're really starting to make strides with each others' families\n
and when i think about the times we have coming for us in 2026, it really feels like we're transitioning from the early stages of this relationship into something much more substantial.\n`,
      nextText: '[ wait...there\s more??? ]'
    },
    {
      title: 'what a special day',
      message: `of course, we've talked at length about how we kind of *know*. and i stand by that. but this year is going to be so big for us.\n
graduation, travel, moving in together, figuring out a future.\n
i used to be afraid of the future, nini, but i think about the fact that 2026 is the year i start to plan my future with my future wife and i can't stop beaming.\n
anyways enough blabbering`,
      nextText: '[ aww thats sweet ]'
    },
    {
      title: 'your gift!',
      message: `i was a little stupid and forgot to bring gifts so im just gonna show you what they are\n
i call it (as a collective):\n
the indecisive long-distance girlfriend's relationship support box`,
      nextText: '[ show me! ]'
    },
    {
      title: 'Jandle',
      image: `${process.env.PUBLIC_URL}/favicon.jpg`,
      imageAlt: 'First anniversary gift',
      message: `ok yeah you already knew about this\n
jandle was first meant to be a replacement for the silly little candle questions we got so much joy out of, but i feel like we've made it so much more special\n
it's not only a reminder to you that i am actully capable of doing somewhat cool things sometimes (lol),\n
but also a reminder that even in the physical distance, we'll fight to feel close whenever the other needs it.`,
      nextText: '[ next gift ]',
      previousText: '[ back ]'
    },
    {
      title: 'scratch off date book',
      image: `${process.env.PUBLIC_URL}/datebook.png`, // Replace with actual image path
      imageAlt: 'Second anniversary gift',
      message: `second gift!\n
this is one of those scratch off date book things where each page has a mystery date that you scratch off and then do!\n
it's totally your call how you/we use it, but i thought it could be a fun way for you to plan some easy indecisive dates\n
and for us to both be swept off our feet mutually by a surprise little date every now and then :)`,
      closeText: '[ wow that\'s so thoughtful! ]',
      previousText: '[ back ]'
    },
    {
      title: 'red dining book',
      image: `${process.env.PUBLIC_URL}/diningbook.png`, // Replace with actual image path
      imageAlt: 'Third anniversary gift',
      message: `third gift!\n
while the other two gifts were planned ideas, this one came to me in the form of *targeted advertisement*\n
and y'know what. it's lowkey kinda perfect for us\n
this book is like a hybrid coupon book and passport specifically for nyc\n
i thought it could be a fun way for us to experience some new, unique dining spots together in the greatest city in the world\n
(our city)\n
and become connoisseurs of dining in the city we fell in love with\n
won't that be fun to tell our kids about`,
      closeText: '[ :) ]',
      previousText: '[ back ]'
    },
    {
      title: 'ok that\'s all',
      message: `that\'s all from me for now nins\n
i'm seriously so endlessly grateful that i can call you my girlf.\n
2026 is gonna be such a josh + nini year. its our year.
      `,
      closeText: '[ happy new year and cheers to 6 months! 🥂 ]',
      previousText: '[ back ]'
    }
  ]
};

// Example: Simple welcome message
export const welcomeFlow = {
  flowId: 'welcome-message',
  pages: [
    {
      title: 'Welcome!',
      message: 'Thanks for visiting. This is a one-time welcome message.',
      closeText: '[ got it ]'
    }
  ]
};

// Example: Multi-step tutorial
export const tutorialFlow = {
  flowId: 'tutorial-v1',
  pages: [
    {
      title: 'Tutorial Step 1',
      message: 'First, do this...',
      nextText: '[ next ]'
    },
    {
      title: 'Tutorial Step 2',
      message: 'Then, do that...',
      nextText: '[ next ]',
      previousText: '[ back ]'
    },
    {
      title: 'Tutorial Step 3',
      message: 'Finally, you\'re all set!',
      closeText: '[ finish ]',
      previousText: '[ back ]'
    }
  ]
};
