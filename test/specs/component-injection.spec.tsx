import * as React from 'react';
import {spy} from 'sinon';
import * as Adapter from 'enzyme-adapter-react-16';
import {configure, mount} from 'enzyme';
import {expect, use} from 'chai';
import * as sinonChai from 'sinon-chai';
import {Module} from '../../lib/Module';
import {Component} from 'react';
import {Inject} from '../../lib/Inject';
import {AService} from '../setup/AService';
import {Buffer} from '../setup/Buffer';
import {ABService} from '../setup/ABService';
import {Interceptor, INTERCEPTOR_TOKEN} from '../setup/Interceptor';
import {AInterceptor} from '../setup/AInterceptor';
import {BInterceptor} from '../setup/BInterceptor';
import {BService} from '../setup/BService';

use(sinonChai);
configure({adapter: new Adapter()});

describe('component-injection', () => {

  describe('simple service injection', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should inject service (useClass)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useClass: AService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should accessible multiple times', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useClass: AService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service (shorthand for useClass)', () => {
      let child;
      mount(
        <Module providers={[AService]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service AB for service A (useClass)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useClass: ABService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(ABService);
    });

    it('should inject service (useValue)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useValue: new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service (useFactory)', () => {
      let child;
      mount(
        <Module providers={[{provide: AService, useFactory: () => new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service without defining provider due to "autoBindInjectable" is true (uses useClass internally)', () => {
      let child: Child;
      mount(
        <Module autoBindInjectable={true}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should throw due to missing provider', () => {
      let child: Child;
      mount(
        <Module>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(() => child.aService).to.throw(/No matching bindings found for serviceIdentifier: AService/);
    });

    it('should throw cause component is not nested in Module or Provider component', () => {
      let child: Child;
      mount(
        <Buffer>
          <Child onInstance={instance => child = instance}/>
        </Buffer>
      );
      expect(() => child.aService).to.throw(/Component "Child" need to be nested in a Module or Provider Component to use dependency injection/);
    })

  });

  describe('service injection via token', () => {

    const SERVICE_TOKEN = 'service_a';

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject(SERVICE_TOKEN) aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should inject service via token (useClass)', () => {
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useClass: AService}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service via token (useValue)', () => {
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useValue: new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should inject service via token (useFactory)', () => {
      let child;
      mount(
        <Module providers={[{provide: SERVICE_TOKEN, useFactory: () => new AService()}]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
    });

    it('should throw due to missing provider', () => {
      let child: Child;
      mount(
        <Module>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(() => child.aService).to.throw(/No matching bindings found for serviceIdentifier: service_a/);
    });

  });

  describe('multi service injection', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject(INTERCEPTOR_TOKEN) interceptors: Interceptor[];

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should inject all services (useClass)', () => {
      let child;
      mount(
        <Module providers={[
          {provide: INTERCEPTOR_TOKEN, useClass: AInterceptor},
          {provide: INTERCEPTOR_TOKEN, useClass: BInterceptor},
        ]}>
          <Buffer>
            <Child onInstance={instance => child = instance}/>
          </Buffer>
        </Module>
      );
      expect(child)
        .to.have.property('interceptors')
        .which.is.an('array')
        .and.which.has.lengthOf(2);
      expect(child.interceptors[0]).to.be.an.instanceOf(AInterceptor);
      expect(child.interceptors[1]).to.be.an.instanceOf(BInterceptor);
    });

  });

  describe('parent module', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;
      @Inject bService: BService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      render() {
        return ('test');
      }
    }

    it('should inherit providers from parent module', () => {
      let child: Child;
      mount(
        <Module providers={[AService]}>
          <Module providers={[BService]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(AService);
      expect(child).to.have.property('bService').which.is.an.instanceOf(BService);
    });

    it('should override providers from parent module', () => {
      let child: Child;
      mount(
        <Module providers={[AService]}>
          <Module providers={[
            BService,
            {provide: AService, useClass: ABService}
          ]}>
            <Buffer>
              <Child onInstance={instance => child = instance}/>
            </Buffer>
          </Module>
        </Module>
      );
      expect(child).to.have.property('aService').which.is.an.instanceOf(ABService);
      expect(child).to.have.property('bService').which.is.an.instanceOf(BService);
    });

  });

  it('should log warning when trying to overwrite to-be-injected service', () => {

    class Child extends Component<{ onInstance(instance: Child) }> {
      @Inject aService: AService;

      componentDidMount() {
        this.props.onInstance(this);
      }

      provokeWaring() {
        this.aService = {} as any;
      }

      render() {
        return ('test');
      }
    }

    let child: Child;
    mount(
      <Module>
        <Buffer>
          <Child onInstance={instance => child = instance}/>
        </Buffer>
      </Module>
    );

    const warnSpy = spy(console, 'warn');
    child.provokeWaring();
    expect(warnSpy).to.be.called;
  });

});




