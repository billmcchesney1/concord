package com.walmartlabs.concord.runtime.v2.runner;

/*-
 * *****
 * Concord
 * -----
 * Copyright (C) 2017 - 2020 Walmart Inc.
 * -----
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====
 */

import com.google.inject.AbstractModule;
import com.google.inject.multibindings.Multibinder;
import com.walmartlabs.concord.ApiClient;
import com.walmartlabs.concord.policyengine.PolicyEngine;
import com.walmartlabs.concord.runtime.v2.runner.checkpoints.CheckpointService;
import com.walmartlabs.concord.runtime.v2.runner.checkpoints.DefaultCheckpointService;
import com.walmartlabs.concord.runtime.v2.runner.remote.ApiClientProvider;
import com.walmartlabs.concord.runtime.v2.runner.remote.TaskCallEventRecordingListener;
import com.walmartlabs.concord.runtime.v2.runner.tasks.TaskCallListener;
import com.walmartlabs.concord.runtime.v2.runner.tasks.TaskCallPolicyChecker;
import com.walmartlabs.concord.runtime.v2.runner.tasks.TaskV2Provider;
import com.walmartlabs.concord.runtime.v2.sdk.DockerService;
import com.walmartlabs.concord.runtime.v2.sdk.FileService;
import com.walmartlabs.concord.runtime.v2.sdk.SecretService;
import com.walmartlabs.concord.runtime.v2.sdk.TaskProvider;

public class DefaultServicesModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(ApiClient.class).toProvider(ApiClientProvider.class);
        bind(CheckpointService.class).to(DefaultCheckpointService.class);
        bind(DockerService.class).to(DefaultDockerService.class);
        bind(FileService.class).to(DefaultFileService.class);
        bind(PolicyEngine.class).toProvider(PolicyEngineProvider.class);
        bind(SecretService.class).to(DefaultSecretService.class);
        bind(SynchronizationService.class).to(DefaultSynchronizationService.class);

        Multibinder<TaskProvider> taskProviders = Multibinder.newSetBinder(binder(), TaskProvider.class);
        taskProviders.addBinding().to(TaskV2Provider.class);

        Multibinder<TaskCallListener> taskCallListeners = Multibinder.newSetBinder(binder(), TaskCallListener.class);
        taskCallListeners.addBinding().to(TaskCallEventRecordingListener.class);
        taskCallListeners.addBinding().to(TaskCallPolicyChecker.class);
    }
}