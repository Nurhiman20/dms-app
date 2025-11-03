import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div>You did it!</div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('You did it!')
  })
})
