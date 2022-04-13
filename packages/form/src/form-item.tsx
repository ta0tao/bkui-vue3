/*
* Tencent is pleased to support the open source community by making
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
*
* Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
*
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
*
* License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
*
* ---------------------------------------------------
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
* to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of
* the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
* THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
* CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*/
import {
  classes,
  PropTypes,
} from '@bkui-vue/shared';
import type { ExtractPropTypes } from 'vue';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  toRefs,
} from 'vue';

import { formKey } from './common';
import type { IFormItemRules } from './type';
import validator from './validator';

const formItemProps = {
  label: PropTypes.string,
  labelWidth: PropTypes.oneOfType([Number, String]),
  labelPosition: PropTypes.oneOf(['left', 'center', 'right']),
  property: PropTypes.string.def(''),
  required: PropTypes.bool.def(false),
  email: PropTypes.bool.def(false),
  max: PropTypes.number,
  min: PropTypes.number,
  maxlength: PropTypes.number,
  rules: PropTypes.array,
  autoCheck: PropTypes.bool.def(false),
  description: PropTypes.string,
};

export type FormItemProps = Readonly<ExtractPropTypes<typeof formItemProps>>;

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const mergeRules: (
  configRules: IFormItemRules,
  propsRules: IFormItemRules
) => IFormItemRules = (configRules, propsRules) => {
  const formatConfigRules = configRules.map((rule) => {
    let rulevalidator: (value: any) => boolean;
    if (rule.required) {
      rulevalidator = validator.required;
    } else if (rule.email) {
      rulevalidator = validator.email;
    } else if (Number(rule.max) > -1) {
      rulevalidator = value => validator.max(value, rule.max);
    } else if (Number(rule.min) > -1) {
      rulevalidator = value => validator.min(value, rule.max);
    } else if (Number(rule.maxlength) > -1) {
      rulevalidator = value => validator.min(value, rule.max);
    } else {
      rulevalidator = () => true;
    }
    return {
      validator: rulevalidator,
      message: rule.message,
      trigger: rule.trigger,
    };
  });
  return [...propsRules, ...formatConfigRules];
};

const getRulesFromProps = (props) => {
  const rules: IFormItemRules = [];

  if (props.required) {
    rules.push({
      validator: validator.required,
      message: `${props.label}不能为空`,
      trigger: 'blur',
    });
  }
  if (props.email) {
    rules.push({
      validator: validator.email,
      message: `${props.label}格式不正确`,
      trigger: 'blur',
    });
  }
  if (Number(props.max) > -1) {
    rules.push({
      validator: value => validator.max(value, props.max),
      message: `${props.label}最大值${props.max}`,
      trigger: 'blur',
    });
  }
  if (Number(props.min) > -1) {
    rules.push({
      validator: value => validator.min(value, props.min),
      message: `${props.label}最小值${props.min}`,
      trigger: 'blur',
    });
  }
  if (Number(props.maxlength) > -1) {
    rules.push({
      validator: value => validator.maxlength(value, props.maxlength),
      message: `${props.label}最大长度${props.maxlength}`,
      trigger: 'blur',
    });
  }
  return rules;
};


const isValid = (value: string | number): boolean => value !== undefined;


export default defineComponent({
  name: 'BKFormItem',
  props: formItemProps,
  setup(props) {
    const currentInstance = getCurrentInstance();
    const state = reactive({
      isError: false,
      errorMessage: '',
    });
    const form = inject(formKey);
    const isForm = Boolean(form);

    const labelStyles = computed<object>(() => {
      const styles = {
        width: '',
        paddingRight: '',
        textAlign: '',
      };
      const labelWidth = isValid(props.labelWidth) ? props.labelWidth : (isForm && form.props.labelWidth);
      if (isValid(labelWidth)) {
        styles.width = `${labelWidth}px`;
        styles.paddingRight = labelWidth ? '' : '0px';
      }

      const labelPosition = props.labelPosition || (isForm && form.props.labelPosition);
      if (labelPosition) {
        styles['text-align'] = labelPosition;
      }

      return styles;
    });


    /**
     * @desc 验证字段
     * @returns { Promise }
     */
    const validate = () => {
      // 没有设置 property 不进行验证
      if (!props.property
      || (isForm && !form.props.model)) {
        return Promise.resolve();
      }
      let rules: IFormItemRules = [];
      // 继承 form 的验证规则
      if (isForm
        && form.props.rules
        && hasOwn(form.props.rules, props.property)) {
        rules = form.props.rules[props.property];
      }
      // form-item 自己的 rules 规则优先级更高
      if (props.rules) {
        rules = props.rules as IFormItemRules;
      }
      // 合并规则属性配置
      rules = mergeRules(rules, getRulesFromProps(props));
      const value = form.props.model[props.property];

      const doValidate = (() => {
        let stepIndex = -1;
        return () => {
          stepIndex = stepIndex + 1;
          if (stepIndex >= rules.length) {
            return Promise.resolve();
          }
          const rule = rules[stepIndex];
          return Promise.resolve()
            .then(() => {
              const result = rule.validator(value);
              // 异步验证
              if (typeof result !== 'boolean'
                && typeof result.then === 'function') {
                return result.then(() => doValidate, () => {
                  state.isError = true;
                  state.errorMessage = rule.message;
                  return Promise.reject(rule.message);
                });
              }
              // 验证失败
              if (!result) {
                state.isError = true;
                state.errorMessage = rule.message;
                return Promise.reject(rule.message);
              }
              // 下一步
              return doValidate();
            });
        };
      })();
      return doValidate();
    };
    /**
     * @desc 清除验证状态
     * @returns { void }
     */
    const clearValidate = () => {
      state.isError = false;
      state.errorMessage = '';
    };
    onMounted(() => {
      if (isForm) {
        form.register(currentInstance.proxy);
      }
    });
    onBeforeUnmount(() => {
      if (isForm) {
        form.unregister(currentInstance.proxy);
      }
    });
    return {
      ...toRefs(state),
      labelStyles,
      validate,
      clearValidate,
    };
  },
  render() {
    const itemClassees = classes({
      'bk-form-item': true,
      'is-error': this.isError,
      'is-required': this.required,
    });

    return (
      <div class={itemClassees}>
        <div
          class="bk-form-label"
          style={this.labelStyles}>
            {
            this.$slots.label
              ? this.$slots.label()
              : this.label
            }
        </div>
        <div class="bk-form-content">
          {this.$slots.default?.()}
          {
            this.isError
            && <div class="bk-form-error">
              {this.$slots.error
                ? this.$slots.error(this.errorMessage)
                : this.errorMessage}
              </div>
          }
        </div>
      </div>
    );
  },
});
